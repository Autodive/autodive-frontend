import { baseURL } from "@/config";

export function exportProject(params) {
  var url = baseURL + "/export/project/" + params.projectId +"?otpToken=" + params.otpToken
  startDownLoad(url)
}
export function exportResource(params) {
  var url = baseURL + '/export/resource/' + params.resourceId + "?otpToken=" + params.otpToken
  startDownLoad(url)
}
export function exportAnnotation(params) {
  var url = baseURL + "/export/annotation/" + params.projectId +"?resourceId=" + params.resourceId +"&layerId=" + params.layerId + "&otpToken=" + params.otpToken
  startDownLoad(url)
}

export function exportBenti(params) {
  var url = baseURL + "/import/definrelation/" + params.projectId +"?otpToken=" + params.otpToken
  startDownLoad(url)
}


export function startDownLoad(url) {
  const link = document.createElement('a');
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link) 
}

