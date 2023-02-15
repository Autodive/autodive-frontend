import { Dropdown, DropdownMenu, DropdownItem, Button } from 'element-ui'

import styles from './annotation.module.scss'
import classNames from 'classnames/bind'

import moreImg from '../../../assets/more.png'

export default {
  data() {
    return {
      act: 1,
    }
  },
  render() {
    const { act } = this
    return (
      <div>
        <ul class={styles.tab}>
          <li
            class={classNames({ hov: act === 1 })}
            onClick={() => (this.act = 1)}
          >
            实体标签
          </li>
          <li
            class={classNames({ hov: act === 2 })}
            onClick={() => (this.act = 2)}
          >
            关系标签
          </li>
        </ul>
        {act === 1 && (
          <div class={styles.borbox}>
            <ul class="leftlist">
              {leftlist.map((item) => (
                <li style={{ borderColor: item.color }}>
                  <div class="listname">{item.name}</div>
                  <div class={classNames('liststart', { liststart2: item.isadd })} />
                  <div class="listkey">快捷键：{item.key}</div>
                  <Dropdown>
                    <img class="listmore" src={moreImg} />
                    <DropdownMenu slot="dropdown">
                      <DropdownItem>编辑标签</DropdownItem>
                      <DropdownItem>删除标签</DropdownItem>
                      <DropdownItem>新建标签</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </li>
              ))}
            </ul>
            <Button class="btnadd" icon="el-icon-plus" type="primary"></Button>
          </div>
        )}
        {act === 2 && (
          <div class={styles.borbox}>
            <ul class="leftlist">
              {leftlist2.map((item) => (
                <li>
                  <div style={{backgroundColor: item.color}} class={styles.circolor} />
                  <div class="listname">{item.name}</div>
                  <div class={classNames('liststart', { liststart2: item.isadd })} />
                  <div class="listkey">快捷键：{item.key}</div>
                  <Dropdown>
                    <img class="listmore" src={moreImg} />
                    <DropdownMenu slot="dropdown">
                      <DropdownItem>编辑标签</DropdownItem>
                      <DropdownItem>删除标签</DropdownItem>
                      <DropdownItem>新建标签</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  },
}

const leftlist = [
  {
    name: '威胁主体',
    color: '#D63C45',
    key: 'A',
    isadd: true,
  },
  {
    name: '报告',
    color: '#E96C45',
    key: 'B',
    isadd: true,
  },
  {
    name: '威胁指示器',
    color: '#FFA842',
    key: 'C',
    isadd: false,
  },
  {
    name: '战役',
    color: '#FFDC26',
    key: 'Z',
    isadd: false,
  },
  {
    name: '战术',
    color: '#E6E945',
    key: 'Z',
    isadd: false,
  },
  {
    name: '攻击模式',
    color: '#BEE945',
    key: 'Z',
    isadd: false,
  },
  {
    name: '恶意代码',
    color: '#9BE8F3',
    key: 'Z',
    isadd: false,
  },
  {
    name: '攻击工具',
    color: '#66D5F9',
    key: 'Z',
    isadd: false,
  },
  {
    name: '防御策略',
    color: '#70E1CB',
    key: 'Z',
    isadd: false,
  },
  {
    name: '隐患',
    color: '#4587E9',
    key: 'Z',
    isadd: false,
  },
  {
    name: '目标客体',
    color: '#4845E9',
    key: 'Z',
    isadd: false,
  },
  {
    name: '标签名',
    color: '#d9538d',
    key: 'Z',
    isadd: false,
  },
]

const leftlist2 = [
  {
    name: '属于',
    color: '#D63C45',
    key: 'A',
    isadd: true,
  },
  {
    name: '关于',
    color: '#E96C45',
    key: 'B',
    isadd: true,
  },
  {
    name: '包含',
    color: '#FFA842',
    key: 'C',
    isadd: false,
  },
  {
    name: '使用',
    color: '#FFDC26',
    key: 'Z',
    isadd: false,
  },
  {
    name: '动作关联',
    color: '#E6E945',
    key: 'Z',
    isadd: false,
  },
  {
    name: '模块相似',
    color: '#BEE945',
    key: 'Z',
    isadd: false,
  },
  {
    name: '利用',
    color: '#9BE8F3',
    key: 'Z',
    isadd: false,
  },
  {
    name: '存在于',
    color: '#d9538d',
    key: 'Z',
    isadd: false,
  },
]

