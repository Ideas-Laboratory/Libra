import Instrument from "../instrument/instrument";
import { Layer } from "../layer";
import { Service } from "../service";
import { GraphicalTransformer } from "../transformer";
type InteractionFlowOption = {
    comp: string;
    name?: string;
    sharedVar?: {
        [varName: string]: any;
    };
    dimension?: string | string[];
    [params: string]: any;
};
type InteractionBuildTemplate = {
    inherit: string;
    name?: string;
    layers?: (Layer<any> | {
        layer: Layer<any>;
        options: any;
    })[];
    sharedVar?: {
        [varName: string]: any;
    };
    remove?: {
        find: string;
        cascade?: boolean;
    }[];
    override?: {
        find: string;
        comp: string;
        name?: string;
        sharedVar?: {
            [varName: string]: any;
        };
        [params: string]: any;
    }[];
    insert?: {
        find?: string;
        flow: (InteractionFlowOption | InteractionFlowOption[] | Service | GraphicalTransformer | Service[] | GraphicalTransformer[] | ((...args: any) => InteractionFlowOption))[];
    }[];
};
export declare class Interaction {
    static build(options: InteractionBuildTemplate): Instrument;
}
export {};
