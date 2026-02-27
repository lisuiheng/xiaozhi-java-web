import { defineConfig, loadEnv } from 'vite';
import createPlugins from './vite/plugins';
import autoprefixer from 'autoprefixer'; // css自动添加兼容性前缀
import path from 'path';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    base: env.VITE_APP_CONTEXT_PATH,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // https://cn.vitejs.dev/config/#resolve-extensions
    plugins: createPlugins(env, command === 'build'),
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      open: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          // target: 'http://localhost:8080',
          target: 'http://localhost:8001',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        },
        [env.VITE_ASTRA_SERVER_BASE_API]: {
          target: 'http://localhost:8001',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_ASTRA_SERVER_BASE_API), '/api/v1')
        },
      },
      configureServer: (server) => {
        // 监听代理请求 - 修复版本
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';

          console.log('=== Vite 代理调试信息 ===');
          console.log(`请求路径: ${url}`);
          console.log(`请求方法: ${req.method}`);
          console.log(`请求头 host: ${req.headers.host}`);
          console.log(`时间: ${new Date().toISOString()}`);

          // 检查是否匹配代理规则
          if (url.startsWith(proxyApi)) {
            console.log(`匹配到代理规则: ${proxyApi} -> http://localhost:8080`);
          } else if (url.startsWith(astraProxyApi)) {
            console.log(`匹配到代理规则: ${astraProxyApi} -> http://localhost:8001/api/v1`);
          } else {
            console.log('未匹配到代理规则，使用本地资源');
          }

          console.log('========================');
          next();
        });

        // 响应监听 - 优化版本
        server.httpServer?.on('request', (req, res) => {
          const { url } = req;

          // 只监听代理请求
          if (!url?.startsWith(proxyApi) && !url?.startsWith(astraProxyApi)) {
            return;
          }

          const originalWrite = res.write;
          const originalEnd = res.end;
          const chunks: Buffer[] = [];
          const startTime = Date.now();

          res.write = function(chunk, ...args) {
            if (chunk) {
              chunks.push(Buffer.from(chunk));
            }
            return originalWrite.apply(this, [chunk, ...args]);
          };

          res.end = function(chunk, ...args) {
            if (chunk) {
              chunks.push(Buffer.from(chunk));
            }

            const duration = Date.now() - startTime;
            const body = Buffer.concat(chunks).toString('utf8');

            console.log('\n=== 代理响应信息 ===');
            console.log(`请求URL: ${url}`);
            console.log(`响应状态码: ${res.statusCode}`);
            console.log(`响应时间: ${duration}ms`);
            console.log(`响应体大小: ${body.length} bytes`);

            // 尝试解析JSON响应
            try {
              const jsonData = JSON.parse(body);
              console.log(`响应类型: JSON`);
              console.log(`响应数据: ${JSON.stringify(jsonData, null, 2).substring(0, 300)}...`);
            } catch (e) {
              // 如果不是JSON，显示部分内容
              console.log(`响应类型: 非JSON`);
              if (body.length > 0) {
                console.log(`响应预览: ${body.substring(0, 200)}...`);
              }
            }

            console.log('===================\n');
            return originalEnd.apply(this, [chunk, ...args]);
          };
        });

        // 可选：添加WebSocket代理调试
        server.ws?.on('connection', (socket, req) => {
          const url = req.url || '';
          if (url.includes(proxyApi) || url.includes(astraProxyApi)) {
            console.log(`WebSocket连接: ${url}`);
          }
        });
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          // additionalData: '@use "@/assets/styles/variables.module.scss as *";'
          // javascriptEnabled: true
          api: 'modern-compiler'
        }
      },
      postcss: {
        plugins: [
          // 浏览器兼容性
          autoprefixer(),
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                atRule.remove();
              }
            }
          }
        ]
      }
    },
    // 预编译
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@vueuse/core',
        'echarts',
        'vue-i18n',
        '@vueup/vue-quill',
        'image-conversion',
        'element-plus/es/components/**/css'
      ]
    }
  };
});
