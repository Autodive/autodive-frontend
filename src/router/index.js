import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/layouts'
import EmptyLayout from '@/layouts/EmptyLayout'
import { publicPath, routerMode } from '@/config'
import i18next from 'i18next';
Vue.use(VueRouter)
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true,
  },
  {
    path: '/register',
    component: () => import('@/views/register/index'),
    hidden: true,
  },
  {
    path: '/password',
    component: () => import('@/views/register/password'),
    hidden: true,
  },
  {
    path: '/401',
    name: '401',
    component: () => import('@/views/401'),
    hidden: true,
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    hidden: true,
  },
]

export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: 'Index',
        component: () => import('@/views/index/index'),
        meta: {
          get title() {
            return i18next.t('首页');
          },
          icon: 'home',
          affix: true,
          noKeepAlive: true,
        },
      },
    ],
  },
  {
    path: '/projectnav',
    component: Layout,
    redirect: 'noRedirect',
    children: [
      {
        path: 'list',
        name: 'Index',
        component: () => import('@/views/project/list'),
        meta: {
          get title() {
            return i18next.t('项目管理');
          },
          icon: 'list',
          noKeepAlive: true
        },
      },
    ],
  },
  {
    path: '/project',
    name: ' 项目',
    component: () => import('@/views/project/index'),
    hidden: true,
    children: [
      {
        path: 'home',
        name: '项目主页',
        component: () => import('@/views/project/home'),
        hidden: true,
      },
      {
        path: 'zhiyuan',
        name: '资源管理',
        component: () => import('@/views/project/zhiyuan'),
        hidden: true,
      },
      {
        path: 'zhiyuanAdd',
        name: '导入资源',
        component: () => import('@/views/project/zhiyuanAdd'),
        hidden: true,
        isShow:false
      },
      {
        path: 'zhiyuanok',
        name: '指派完成',
        component: () => import('@/views/project/zhiyuanok'),
        hidden: true,
        isShow:false
      },
      {
        path: 'benti',
        name: '本体管理',
        component: () => import('@/views/project/benti'),
        hidden: true,
      },
      {
        path: 'annotation',
        name: '语料管理',
        component: () => import('@/views/project/annotation'),
        hidden: true,
      },
      {
        path: 'quanxian',
        name: '权限管理',
        component: () => import('@/views/project/quanxian'),
        hidden: true,
      },
      {
        path: 'home2',
        name: '项目主页',
        component: () => import('@/views/project/home2'),
        hidden: true,
      }
    ]
  },


  {
    path: '*',
    redirect: '/404',
    hidden: true,
  },
]

const router = new VueRouter({
  base: routerMode === 'history' ? publicPath : '',
  mode: routerMode,
  scrollBehavior: () => ({
    y: 0,
  }),
  routes: constantRoutes,
})

export function resetRouter() {
  router.matcher = new VueRouter({
    base: routerMode === 'history' ? publicPath : '',
    mode: routerMode,
    scrollBehavior: () => ({
      y: 0,
    }),
    routes: constantRoutes,
  }).matcher
}

export default router
