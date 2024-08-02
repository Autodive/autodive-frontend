import defaultStyles from './defaultStyles';

const {
  iconStyles,
  nodeStyles,
  anchorPointStyles,
  nodeLabelStyles,
} = defaultStyles;

function getStyle (options, cfg) {
  return {
    ...cfg,
    ...nodeStyles,
    ...options,
    ...cfg.style,
    labelCfg: {
      ...nodeLabelStyles,
      ...cfg.labelCfg,
      style: {
        ...nodeLabelStyles.style,
        ...(cfg.labelCfg ? cfg.labelCfg.style : {}),
      },
    },
    iconStyles: {
      ...iconStyles,
      ...cfg.iconStyles,
    },
    anchorPointStyles: {
      ...anchorPointStyles,
      ...cfg.anchorPointStyles,
    },
    ...cfg.nodeStateStyles,
    anchorHotsoptStyles: cfg.anchorHotsoptStyles,
  };
}

export default G6 => {
  G6.registerNode('rect-node', {
    shapeType: 'rect',
    getShapeStyle (cfg) {
      const width = cfg.style.width || 80;
      const height = cfg.style.height || 40;

      return getStyle.call(this, {
        width,
        height,
        radius: 5,
        x:      -width / 2,
        y:      -height / 2,
      }, cfg);
    },
  }, 'base-node');

  G6.registerNode('circle-node', {
    shapeType: 'circle',
    getShapeStyle(cfg) {
      const r = cfg.style.r || 30;

      return getStyle.call(this, {
        r, 
        x: 0,
        y: 0,
      }, cfg);
    },
  }, 'base-node');

  G6.registerNode('ellipse-node', {
    shapeType: 'ellipse',
    getShapeStyle(cfg) {
      return getStyle.call(this, {
        rx: 50,
        ry: 30,
        x:  0,
        y:  0,
      }, cfg);
    },
  }, 'base-node');

  G6.registerNode('modelRect-node', {
    shapeType: 'rect',
    getShapeStyle (cfg) {
      const width = cfg.style.width || 200;
      const height = cfg.style.height || 80;

      return getStyle.call(this, {
        width,
        height,
        radius: 5,
        x:      -width / 2,
        y:      -height / 2,
      }, cfg);
    },
  }, 'base-node');

  G6.registerNode('diamond-node', {
    shapeType: 'path', 
    getShapeStyle (cfg) {
      const path = this.getPath(cfg);

      return getStyle.call(this, {
        path,
        x: 0,
        y: 0,
      }, cfg);
    },
    getPath (cfg) {
      const size = cfg.style.size || [100, 100]; 
      const width = size[0];
      const height = size[1];
      return [
        ['M', 0, -height / 2], 
        ['L', width / 2, 0], 
        ['L', 0, height / 2], 
        ['L', -width / 2, 0],
        ['Z'],
      ];
    },
  }, 'base-node');

  G6.registerNode('triangle-node', {
    shapeType: 'path',
    getShapeStyle(cfg) {
      const path = this.getPath(cfg);

      return getStyle.call(this, {
        direction: cfg.direction || 'up',
        path,
        x:         0,
        y:         0,
      }, cfg);
    },
    getPath (cfg) {
      const direction = cfg.direction || 'up';
      const size = cfg.style.size || [60, 100]; 
      const width = size[0];
      const height = size[1];

      const path = [
        ['Z'],
      ];

      if (direction === 'up') {
        path.unshift(
          ['M', 0, -height / 2],
          ['L', -width / 2, 0], 
          ['L', width / 2, 0], 
        );
      } else {
        path.unshift(
          ['M', 0, height / 2],
          ['L', -width / 2, 0], 
          ['L', width / 2, 0],
        );
      }

      return path;
    },
    getAnchorPoints (cfg) {
      return cfg.anchorPoints || [
        [0.5, 0],
        [0, 1],
        [1, 1],
      ];
    },
  }, 'base-node');
};
