import { config } from '@/config'
export function setUploadUrl(oUrl) {
    if (config.requestMapping && Array.isArray(config.requestMapping)) {
        let found = config.requestMapping.find(element => {
            let re = new RegExp(element.match)
            if (re.test(oUrl)) {
                return element
            }
        })

        if (undefined !== found) {
            let reFound = new RegExp(found.match)
            return oUrl.replace(reFound, found.replace)
        }
    } else {
        return  oUrl;
    }
}