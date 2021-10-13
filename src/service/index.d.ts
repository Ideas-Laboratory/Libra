import { Command } from "../command";
import { Layer } from "../layer";

type ServiceInitOption = {
  on: { [action: string]: Command };
  props: { [key: string]: any };
  preInitialize?: (service: ExternalService) => void;
  postInitialize?: (service: ExternalService) => void;
  preUpdate?: (service: ExternalService) => void;
  postUpdate?: (service: ExternalService) => void;
  preUse?: (service: ExternalService, layer: Layer<any>) => void;
  postUse?: (service: ExternalService, layer: Layer<any>) => void;
  [param: string]: any;
};

type ServiceInitTemplate = ServiceInitOption & {
  constructor?: ServiceConstructor;
};

export declare class ExternalService {
  constructor(baseName: string, options: ServiceInitOption);

  on(action: string, command: Command): void;
  get(key: string, options: any): any;
  set(key: string, value: any, options: any): void;
  preUpdate(): void;
  postUpdate(): void;
  preUse(layer: Layer<any>): void;
  postUse(layer: Layer<any>): void;
  isInstanceOf(name: string): boolean;
}

export default interface ServiceConstructor {
  new (baseName: string, options: ServiceInitOption): ExternalService;

  register(baseName: string, options: ServiceInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: string, options: ServiceInitOption): ExternalService;
  findService(baseNameOrRealName: string): ExternalService[];
}

export function register(baseName: string, options: ServiceInitTemplate): void;
export function unregister(baseName: string): boolean;
export function initialize(
  baseName: string,
  options: ServiceInitOption
): ExternalService;
export function findService(baseNameOrRealName: string): ExternalService[];
