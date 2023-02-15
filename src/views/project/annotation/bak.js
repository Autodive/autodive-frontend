import OntologyIndex from './ontologyIndex'

import styles from './annotation.module.scss'
import PdfZone from './pdfZone'

export default {
  render() {
    return (
      <div class={styles.rootLayout}>
        <div class={styles.leftContent}>
          <OntologyIndex />
        </div>
        <div class={styles.middleContent}>
          <PdfZone />
        </div>
        <div class={styles.rightContent}>预览</div>
      </div>
    )
  },
}
