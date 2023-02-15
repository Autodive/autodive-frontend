import G6 from '@antv/g6'

export default {
  nodes: [
    {
      id: '1',
      x: 141,
      y: 105,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#D63C45',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '威胁主体',
      isadd: true,
      key: 'A',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '2',
      x: 140,
      y: 200,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#E96C45',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '报告',
      isadd: true,
      key: 'B',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '3',
      x: 138,
      y: 328,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#FFA842',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '威胁指示器',
      isadd: false,
      key: 'C',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '4',
      x: 661,
      y: 88,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#FFDC26',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '战役',
      isadd: false,
      key: 'D',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '5',
      x: 513,
      y: 288,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#E6E945',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '战术',
      isadd: false,
      key: 'E',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '6',
      x: 314,
      y: 484,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#BEE945',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '攻击模式',
      isadd: false,
      key: 'F',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '7',
      x: 671,
      y: 479,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#9BE8F3',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '恶意代码',
      isadd: false,
      key: 'G',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '8',
      x: 956,
      y: 476,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#66D5F9',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '攻击工具',
      isadd: false,
      key: 'H',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '9',
      x: 951,
      y: 252,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#70E1CB',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '防御策略',
      isadd: false,
      key: 'I',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
    {
      id: '10',
      x: 951,
      y: 95,
      type: 'rect-node',
      style: {
        fill: '#fff',
        stroke: '#4587E9',
        lineWidth: 2,
        width: 150,
        height: 50,
      },
      label: '隐患',
      isadd: false,
      key: 'J',
      labelCfg: {
        style: {
          fontSize: 16,
        },
      },
    },
  ],
  edges: [
    {
      id:'1-4',
      source: '1',
      target: '4',
      label: '属于',
      key:'A',
      isadd:false,
      labelCfg: {
        style: {
          stroke: 'white', // 给文本添加白边和白色背景
          fill: '#000000', // 文本颜色
          background: {
            fill: '#ffffff',
            stroke: '#D63C45',
            padding: [2, 2, 2, 2],
            radius: 2,
          },
        },
      },
    },
    {
      id:'2-5',
      source: '2',
      target: '5',
      label: '关系标签',
      key:'B',
      isadd:true,
      labelCfg: {
        style: {
          stroke: 'white', // 给文本添加白边和白色背景
          fill: '#000000', // 文本颜色
          background: {
            fill: '#ffffff',
            stroke: '#E96C45',
            padding: [2, 2, 2, 2],
            radius: 2,
          },
        },
      },
    },
    {
      id:'5-9',
      source: '5',
      target: '9',
      label: '包含',
      key:'C',
      isadd:true,
      labelCfg: {
        style: {
          stroke: 'white',
          fill: '#000000',
          background: {
            fill: '#ffffff',
            stroke: '#565ec3',
            padding: [2, 2, 2, 2],
            radius: 2,
          },
        },
      },
    }
  ],
}
