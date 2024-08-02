# AutoDive+: An Adaptive Model Enhanced Multimodal Online Annotation Tool

In previous work, we presented AutoDive, an integrated onsite scientific literature annotation tool, which can make scientists annotate directly on PDF documents. We further extend AutoDive's capabilities by introducing multimodal annotation module, high-value resource ranking module and independently deployed model community, and present an adaptive model enhance multimodal onsite annotation tool: AutoDive+. This tool provides 6 core functions of annotation that support the whole lifecycle of corpus generation. 
They are: 
* Project Management
* Resource Management
* Ontology Management
* Onsite Multimodal Annotation
* Activate Learning Module
* Statistic View

## Online Demo
We deploy an live demo of AutoDive at [https://autodive.c4.eplus.org.cn/](https://autodive.c4.eplus.org.cn/)(test username:  *test*, password: *autodive*) or watch our demostration video on [this site](https://autodive.c4.eplus.org.cn/introVideo/introduce.mp4).

## Installation
* Install git and clone the project to your local computer.
    *   git clone [https://github.com/Autodive/autodive-frontend.git](https://github.com/Autodive/autodive-frontend.git)
* Make sure your computer has node installed. Node 16.13+ is recommended.
* Install npm dependencies and build project.
    * corepack enable pnpm
    * pnpm install
    ^ pnpm -F app-v2 install
    * pnpm -F app-v2 run build
* Test in browser (Access to our public back-end services)
    * pnpm -F app-v2 run dev
* Access [http://127.0.0.1:8081](http://127.0.0.1:8081) in browser.
* Done.
## Main Functions
### Create Project
![1-create](resources/1-create.gif)

### Task Assign
![2-mission](resources/2-mission.gif)

### Create Ontology
![3-create](resources/3-create.gif)

### Multimodal Annotation
![4-mannual](resources/4-mannual.gif)

### Intelligent Annotation
![5-auto](resources/5-auto.gif)

### Corpus Export
![6-export](resources/6-export.gif)

### Project Review
![7-review](resources/7-review.gif)

## License:
This annotation tool is licensed under [Apache License  Version 2.0](https://github.com/Autodive/autodive-frontend/blob/master/LICENSE)
