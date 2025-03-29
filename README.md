# Libra：An Interaction Model for Data Visualization

_Yue Zhao, Yunhai Wang, Xu Luo, Yanyan Wang, Jean-Daniel Fekete_

![teaser](https://jackz.cn/static/media/paper/Libra/5d0cf2ed1540d2bf123e1274ec2972db/37048/teaser.png)
___Figure 1:__ Libra facilitates efficient interaction modeling by enabling the reuse, extension, and combination of built-in interactions. Its prototype, Libra.js, supports seamless exploration of the t-SNE projection of the MNIST dataset with various interactions: (a) hovering a point to show the corresponding image, (b) clicking a data point to highlight the whole class, and (c) dragging cluster centroids to interactively refine k-means clustering while seamlessly integrating with point hovering from (a). (d,e,f) The corresponding Libra.js code snippets for the interactions in (a,b,c), respectively._

__Abstract -__
 While existing visualization libraries enable the reuse, extension, and combination of static visualizations, achieving the same for interactions remains nearly impossible. Therefore, we contribute an interaction model and its implementation to achieve this goal. Our model enables the creation of interactions that support direct manipulation, enforce software modularity by clearly separating visualizations from interactions, and ensure compatibility with existing visualization systems. Interaction management is achieved through an instrument that receives events from the view, dispatches these events to graphical layers containing objects, and then triggers actions. We present a JavaScript prototype implementation of our model called Libra, enabling the specification of interactions for visualizations created by different libraries. We demonstrate the effectiveness of Libra by describing and generating a wide range of existing interaction techniques. We evaluate Libra.js through diverse examples, a metric-based notation comparison, and a performance benchmark analysis.

This repository contains __Libra-js__ code. View more details & examples in _https://ideas-laboratory.github.io/libra-js/_
