# Astra Admin Web

基于 [plus-ui](https://gitee.com/JavaLionLi/plus-ui) 项目深度定制的前端管理界面，采用 Vue3 + TypeScript + Vite 构建，为 Astra 企业级后台管理系统提供现代化的用户界面。

## 项目简介

Astra Admin Web 是 Astra 企业级后台管理系统的前端部分，采用最新的前端技术栈构建，提供直观易用的管理界面，支持设备管理、智能体配置、系统监控等功能。

## 技术栈

- **前端框架**: Vue 3.x
- **编程语言**: TypeScript
- **构建工具**: Vite 5.x
- **样式框架**: UnoCSS
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **图标系统**: SVG 图标
- **代码规范**: ESLint + Prettier

## 项目结构

```
src/
├── api/                    # API 接口定义
│   ├── ai/                 # AI 相关接口
│   │   ├── agent/          # 智能体相关接口
│   │   └── device/         # 设备管理相关接口
│   └── ...                 # 其他业务模块接口
├── assets/                 # 静态资源
├── components/             # 公共组件
├── directive/              # 自定义指令
├── enums/                  # 枚举定义
├── hooks/                  # 自定义 Hook
├── lang/                   # 国际化资源
├── layout/                 # 页面布局
├── plugins/                # 插件
├── router/                 # 路由配置
├── store/                  # Pinia 状态管理
├── types/                  # 类型定义
├── utils/                  # 工具函数
├── views/                  # 页面视图
│   └── ai/                 # AI 模块视图
│       └── agent/          # 智能体管理页面
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
├── permission.ts           # 权限控制
└── settings.ts             # 项目配置
```

## 主要功能

- **智能体管理**: 创建、编辑、删除和管理 AI 智能体
- **设备管理**: 查看和管理连接的设备
- **系统监控**: 实时监控系统状态
- **权限管理**: 基于角色的访问控制
- **会话管理**: 管理用户对话历史和实时会话
- **知识库管理**: 管理 AI 知识库和文档
- **长期记忆管理**: 管理 AI 的长期记忆功能


## 安装与运行

1. 安装依赖:
```bash
npm install
```

2. 启动开发服务器:
```bash
npm run dev
```

3. 构建生产版本:
```bash
npm run build
```

## 环境配置

项目支持多种环境配置:

- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

## API 请求

前端通过 axios 封装的请求实例与后端通信，支持统一的错误处理、请求拦截和响应拦截。

## 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 组件命名采用帕斯卡命名法
- 遵循 Vue 3 的 Composition API 规范

## 部署

构建后的文件位于 `dist/` 目录，可部署至任意静态文件服务器。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

本项目基于 [plus-ui](https://gitee.com/JavaLionLi/plus-ui) 项目进行深度定制开发，原始项目采用 MIT 许可证。本项目在遵循原始项目许可证的基础上，添加了企业级功能扩展和定制化开发。

具体许可证信息请参考原始 [plus-ui](https://gitee.com/JavaLionLi/plus-ui) 项目的 LICENSE 文件。