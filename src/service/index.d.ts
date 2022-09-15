import { Command } from "../command";
import { Layer } from "../layer";

type ServiceInitOption = {
  name?: string;
  on?: { [action: string]: Command };
  sharedVar?: { [key: string]: any };
  preInitialize?: (service: Service) => void;
  postInitialize?: (service: Service) => void;
  preUpdate?: (service: Service) => void;
  postUpdate?: (service: Service) => void;
  preAttach?: (service: Service, layer: Layer<any>) => void;
  postUse?: (service: Service, layer: Layer<any>) => void;
  [param: string]: any;
};

type ServiceInitTemplate = ServiceInitOption & {
  [param: string]: any;
constructor?: ServiceConstructor;
};

export declare class Service {
  constructor(baseName: string, options: ServiceInitOption);

  on(action: string, command: Command): void;
  getSharedVar(sharedName: string, options: any): any;
  setSharedVar(sharedName: string, value: any, options: any): void;
  watchSharedVar(sharedName: string, handler: Command): void;
  preUpdate(): void;
  postUpdate(): void;
  preAttach(layer: Layer<any>): void;
  postUse(layer: Layer<any>): void;
  isInstanceOf(name: string): boolean;
}

export default interface ServiceConstructor {
  new (baseName: string, options: ServiceInitOption): Service;

  register(baseName: string, options: ServiceInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: string, options: ServiceInitOption): Service;
  findService(baseNameOrRealName: string): Service[];
}

export function register(baseName: string, options: ServiceInitTemplate): void;
export function unregister(baseName: string): boolean;
export function initialize(
  baseName: string,
  options: ServiceInitOption
): Service;
export function findService(baseNameOrRealName: string): Service[];
