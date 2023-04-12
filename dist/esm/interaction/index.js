import { registeredInstruments, instanceInstruments, } from "../instrument/instrument";
import Instrument from "../instrument/instrument";
import { Service } from "../service";
import { GraphicalTransformer } from "../transformer";
import SelectionService from "../service/selectionService";
const registeredInteractions = {};
export class Interaction {
    static build(options) {
        if (!(options.inherit in registeredInstruments) &&
            !(options.inherit in registeredInteractions)) {
            throw new Error(`Interaction ${options.inherit} is not registered, please register it first`);
        }
        let instrument;
        if (options.inherit in registeredInstruments) {
            const inheritOption = Object.assign({ constructor: Instrument }, registeredInstruments[options.inherit], {
                sharedVar: Object.assign({}, {
                    layers: options.layers ?? [],
                    layer: options.layers?.length == 1 ? options.layers[0] : undefined,
                }, registeredInstruments[options.inherit].sharedVar ?? {}, options.sharedVar ?? {}),
            });
            if (options.layers) {
                inheritOption.layers = options.layers;
            }
            instrument = new inheritOption.constructor(options.inherit, inheritOption);
            instanceInstruments.push(instrument);
        }
        else {
            const inheritOption = Object.assign({}, registeredInteractions[options.inherit], options, {
                inherit: registeredInteractions[options.inherit].inherit,
                sharedVar: Object.assign({}, {
                    layers: options.layers ?? [],
                    layer: options.layers?.length == 1 ? options.layers[0] : undefined,
                }, registeredInteractions[options.inherit].sharedVar ?? {}, options.sharedVar ?? {}),
            });
            instrument = Interaction.build(inheritOption);
            instanceInstruments.push(instrument);
        }
        if (options.name) {
            registeredInteractions[options.name] = options;
            if (!options.layers || !options.layers.length)
                return;
        }
        const findNested = (parent, findType) => {
            if (parent instanceof Instrument) {
                const s = parent._serviceInstances.find((service) => service.isInstanceOf(findType));
                if (s)
                    return [s, parent];
                const t = parent.transformers.find((transformer) => transformer.isInstanceOf(findType));
                if (t)
                    return [t, parent];
                for (let service of parent._serviceInstances) {
                    const result = findNested(service, findType);
                    if (result)
                        return result;
                }
            }
            else {
                const s = parent.services.find((service) => service.isInstanceOf(findType));
                if (s)
                    return [s, parent];
                const t = parent.transformers.find((transformer) => transformer.isInstanceOf(findType));
                if (t)
                    return [t, parent];
                for (let service of parent.services) {
                    const result = findNested(service, findType);
                    if (result)
                        return result;
                }
            }
            return [undefined, undefined];
        };
        const findNestedReference = (parent, findType) => {
            if (parent.isInstanceOf(findType))
                return parent;
            if (parent instanceof Instrument) {
                const s = parent._serviceInstances.find((service) => service.isInstanceOf(findType));
                if (s)
                    return s;
                for (let service of parent._serviceInstances) {
                    const result = findNestedReference(service, findType);
                    if (result)
                        return result;
                }
            }
            else {
                const s = parent.services.find((service) => service.isInstanceOf(findType));
                if (s)
                    return s;
                for (let service of parent.services) {
                    const result = findNestedReference(service, findType);
                    if (result)
                        return result;
                }
            }
        };
        if (options.remove) {
            for (let removeOption of options.remove) {
                const [removeNode, parentNode] = findNested(instrument, removeOption.find);
                if (!removeNode)
                    continue;
                let parentServiceArray = parentNode instanceof Instrument
                    ? parentNode._serviceInstances
                    : parentNode._services;
                if (removeOption.cascade) {
                    if (removeNode instanceof Service) {
                        parentServiceArray.splice(parentServiceArray.indexOf(removeNode), 1);
                    }
                    else {
                        parentNode._transformers.splice(parentNode._transformers.indexOf(removeNode), 1);
                    }
                }
                else {
                    if (removeNode instanceof Service) {
                        parentServiceArray.splice(parentServiceArray.indexOf(removeNode), 1, ...removeNode._services);
                        parentNode._transformers.push(...removeNode._transformers);
                    }
                    else {
                        parentNode._transformers.splice(parentNode._transformers.indexOf(removeNode), 1);
                    }
                }
            }
        }
        if (options.override) {
            for (let overrideOption of options.override) {
                const [removeNode, parentNode] = findNested(instrument, overrideOption.find);
                if (!removeNode)
                    continue;
                let replaceNode;
                if (overrideOption.comp.includes("Transformer")) {
                    let transformer;
                    if (overrideOption.name) {
                        if (GraphicalTransformer.findTransformer(overrideOption.name).length >
                            0) {
                            transformer = GraphicalTransformer.findTransformer(overrideOption.name)[0];
                        }
                    }
                    if (!transformer)
                        transformer = GraphicalTransformer.initialize(overrideOption.comp, {
                            name: overrideOption.name,
                            sharedVar: {
                                ...(options.sharedVar || {}),
                                ...(overrideOption.sharedVar || {}),
                            },
                        });
                    replaceNode = transformer;
                }
                else if (overrideOption.comp.includes("Service")) {
                    let service;
                    if (overrideOption.name) {
                        if (Service.findService(overrideOption.name).length > 0) {
                            service = Service.findService(overrideOption.name)[0];
                        }
                    }
                    if (!service)
                        service = Service.initialize(overrideOption.comp, {
                            ...overrideOption,
                            services: [
                                ...(overrideOption.services || []),
                                ...(removeNode instanceof Service ? removeNode._services : []),
                            ],
                            transformers: [
                                ...(overrideOption.transformers || []),
                                ...(removeNode instanceof Service
                                    ? removeNode._transformers
                                    : []),
                            ],
                            sharedVar: {
                                ...(options.sharedVar || {}),
                                ...(overrideOption.sharedVar || {}),
                            },
                        });
                    if (overrideOption.dimension &&
                        service.isInstanceOf("SelectionService")) {
                        service = service.dimension(overrideOption.dimension);
                        if (overrideOption.layers) {
                            service._layerInstances = overrideOption.layers.slice(0);
                        }
                        if (overrideOption.sharedVar) {
                            service.setSharedVars(overrideOption.sharedVar);
                        }
                    }
                    replaceNode = service;
                }
                let parentServiceArray = parentNode instanceof Instrument
                    ? parentNode._serviceInstances
                    : parentNode._services;
                if (removeNode instanceof Service) {
                    parentServiceArray.splice(parentServiceArray.indexOf(removeNode), 1);
                }
                else {
                    parentNode._transformers.splice(parentNode._transformers.indexOf(removeNode), 1);
                }
                if (overrideOption.comp.includes("Transformer")) {
                    parentNode._transformers.push(replaceNode);
                }
                else {
                    parentServiceArray.push(replaceNode);
                }
            }
        }
        if (options.insert) {
            for (let insert of options.insert) {
                const insertNode = findNestedReference(instrument, insert.find);
                if (!insertNode)
                    continue;
                let prevComponent = null;
                let prevType = null;
                for (let i = insert.flow.length - 1; i >= 0; i--) {
                    const componentOption = insert.flow[i];
                    if (componentOption instanceof Function) {
                        const newPrevComponent = [];
                        let newPrevType = null;
                        for (let j = 0; j < options.layers?.length ?? 0; j++) {
                            const layer = options.layers[j];
                            const generatedOption = componentOption(layer, j);
                            if (generatedOption.comp.includes("Transformer")) {
                                let transformer;
                                if (generatedOption.name) {
                                    if (GraphicalTransformer.findTransformer(generatedOption.name)
                                        .length > 0) {
                                        transformer = GraphicalTransformer.findTransformer(generatedOption.name)[0];
                                    }
                                }
                                if (!transformer)
                                    transformer = GraphicalTransformer.initialize(generatedOption.comp, {
                                        ...generatedOption,
                                        sharedVar: {
                                            ...(options.sharedVar || {}),
                                            ...(generatedOption.sharedVar || {}),
                                        },
                                    });
                                newPrevComponent.push(transformer);
                                newPrevType = "Transformer";
                            }
                            else if (generatedOption.comp.includes("Service")) {
                                let service;
                                if (generatedOption.name) {
                                    if (Service.findService(generatedOption.name).length > 0) {
                                        service = Service.findService(generatedOption.name)[0];
                                    }
                                }
                                if (!service)
                                    service = Service.initialize(generatedOption.comp, {
                                        ...generatedOption,
                                        ...(prevComponent
                                            ? prevType == "Transformer"
                                                ? {
                                                    transformers: prevComponent instanceof Array
                                                        ? prevComponent
                                                        : [prevComponent],
                                                }
                                                : {
                                                    services: prevComponent instanceof Array
                                                        ? prevComponent
                                                        : [prevComponent],
                                                }
                                            : {}),
                                        sharedVar: {
                                            ...(options.sharedVar || {}),
                                            ...(generatedOption.sharedVar || {}),
                                        },
                                    });
                                if (generatedOption.dimension &&
                                    service instanceof SelectionService) {
                                    service = service.dimension(generatedOption.dimension);
                                    if (generatedOption.layers) {
                                        service._layerInstances = generatedOption.layers.slice(0);
                                    }
                                    if (generatedOption.sharedVar) {
                                        service.setSharedVars(generatedOption.sharedVar);
                                    }
                                }
                                newPrevComponent.push(service);
                                newPrevType = "Service";
                            }
                        }
                        prevComponent = newPrevComponent;
                        prevType = newPrevType;
                    }
                    else if (componentOption instanceof Array) {
                        const newPrevComponent = [];
                        let newPrevType = null;
                        for (let j = 0; j < componentOption.length; j++) {
                            const component = componentOption[j];
                            if (component instanceof GraphicalTransformer) {
                                newPrevComponent.push(component);
                                newPrevType = "Transformer";
                            }
                            else if (component instanceof Service) {
                                if (prevType == "Transformer") {
                                    component._transformers.push(...(prevComponent instanceof Array
                                        ? prevComponent
                                        : [prevComponent]));
                                }
                                else {
                                    component._services.push(...(prevComponent instanceof Array
                                        ? prevComponent
                                        : [prevComponent]));
                                }
                                newPrevComponent.push(component);
                                newPrevType = "Service";
                            }
                            else if (component.comp.includes("Transformer")) {
                                let transformer;
                                if (component.name) {
                                    if (GraphicalTransformer.findTransformer(component.name)
                                        .length > 0) {
                                        transformer = GraphicalTransformer.findTransformer(component.name)[0];
                                    }
                                }
                                if (!transformer)
                                    transformer = GraphicalTransformer.initialize(component.comp, {
                                        ...component,
                                        sharedVar: {
                                            ...(options.sharedVar || {}),
                                            ...(component.sharedVar || {}),
                                        },
                                    });
                                newPrevComponent.push(transformer);
                                newPrevType = "Transformer";
                            }
                            else if (component.comp.includes("Service")) {
                                let service;
                                if (component.name) {
                                    if (Service.findService(component.name).length > 0) {
                                        service = Service.findService(component.name)[0];
                                    }
                                }
                                if (!service)
                                    service = Service.initialize(component.comp, {
                                        ...component,
                                        ...(prevComponent
                                            ? prevType == "Transformer"
                                                ? {
                                                    transformers: prevComponent instanceof Array
                                                        ? prevComponent
                                                        : [prevComponent],
                                                }
                                                : {
                                                    services: prevComponent instanceof Array
                                                        ? prevComponent
                                                        : [prevComponent],
                                                }
                                            : {}),
                                        sharedVar: {
                                            ...(options.sharedVar || {}),
                                            ...(component.sharedVar || {}),
                                        },
                                    });
                                if (component.dimension &&
                                    service instanceof SelectionService) {
                                    service = service.dimension(component.dimension);
                                    if (component.layers) {
                                        service._layerInstances = component.layers.slice(0);
                                    }
                                    if (component.sharedVar) {
                                        service.setSharedVars(component.sharedVar);
                                    }
                                }
                                newPrevComponent.push(service);
                                newPrevType = "Service";
                            }
                        }
                        prevComponent = newPrevComponent;
                        prevType = newPrevType;
                    }
                    else if (componentOption instanceof GraphicalTransformer) {
                        prevComponent = componentOption;
                        prevType = "Transformer";
                    }
                    else if (componentOption instanceof Service) {
                        if (prevType == "Transformer") {
                            componentOption._transformers.push(...(prevComponent instanceof Array
                                ? prevComponent
                                : [prevComponent]));
                        }
                        else {
                            componentOption._services.push(...(prevComponent instanceof Array
                                ? prevComponent
                                : [prevComponent]));
                        }
                        prevComponent = componentOption;
                        prevType = "Service";
                    }
                    else if (componentOption.comp.includes("Transformer")) {
                        let transformer;
                        if (componentOption.name) {
                            if (GraphicalTransformer.findTransformer(componentOption.name)
                                .length > 0) {
                                transformer = GraphicalTransformer.findTransformer(componentOption.name)[0];
                            }
                        }
                        if (!transformer)
                            transformer = GraphicalTransformer.initialize(componentOption.comp, {
                                ...componentOption,
                                sharedVar: {
                                    ...(options.sharedVar || {}),
                                    ...(componentOption.sharedVar || {}),
                                },
                            });
                        prevComponent = transformer;
                        prevType = "Transformer";
                    }
                    else if (componentOption.comp.includes("Service")) {
                        let service;
                        if (componentOption.name) {
                            if (Service.findService(componentOption.name).length > 0) {
                                service = Service.findService(componentOption.name)[0];
                            }
                        }
                        if (!service)
                            service = Service.initialize(componentOption.comp, {
                                ...componentOption,
                                ...(prevComponent
                                    ? prevType == "Transformer"
                                        ? {
                                            transformers: prevComponent instanceof Array
                                                ? prevComponent
                                                : [prevComponent],
                                        }
                                        : {
                                            services: prevComponent instanceof Array
                                                ? prevComponent
                                                : [prevComponent],
                                        }
                                    : {}),
                                sharedVar: {
                                    ...(options.sharedVar || {}),
                                    ...(componentOption.sharedVar || {}),
                                },
                            });
                        if (componentOption.dimension &&
                            service.isInstanceOf("SelectionService")) {
                            service = service.dimension(componentOption.dimension);
                            if (componentOption.layers) {
                                service._layerInstances = componentOption.layers.slice(0);
                            }
                            if (componentOption.sharedVar) {
                                service.setSharedVars(componentOption.sharedVar);
                            }
                        }
                        prevComponent = service;
                        prevType = "Service";
                    }
                }
                if (prevComponent) {
                    if (prevType == "Transformer") {
                        if (prevComponent instanceof Array) {
                            insertNode._transformers.push(...prevComponent);
                        }
                        else {
                            insertNode._transformers.push(prevComponent);
                        }
                    }
                    else {
                        if (insertNode instanceof Instrument) {
                            if (prevComponent instanceof Array) {
                                insertNode._serviceInstances.push(...prevComponent);
                            }
                            else {
                                insertNode._serviceInstances.push(prevComponent);
                            }
                        }
                        else {
                            if (prevComponent instanceof Array) {
                                insertNode._services.push(...prevComponent);
                            }
                            else {
                                insertNode._services.push(prevComponent);
                            }
                        }
                    }
                }
            }
        }
        return instrument;
    }
}
