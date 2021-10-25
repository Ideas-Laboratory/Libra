import { Command } from "../command";
import { Layer } from "../layer";

type ServiceInitOption = {
  name?: string;
  on?: { [action: string]: Command };
  sharedVar?: { [key: string]: any };
  preInitialize?: (service: InteractionService) => void;
  postInitialize?: (service: InteractionService) => void;
  preUpdate?: (service: InteractionService) => void;
  postUpdate?: (service: InteractionService) => void;
  preUse?: (service: InteractionService, layer: Layer<any>) => void;
  postUse?: (service: InteractionService, layer: Layer<any>) => void;
  [param: string]: any;
};

type ServiceInitTemplate = ServiceInitOption & {
  constructor?: ServiceConstructor;
};

export declare class InteractionService {
  constructor(baseName: string, options: ServiceInitOption);

  on(action: string, command: Command): void;
  getSharedVar(sharedName: string, options: any): any;
  setSharedVar(sharedName: string, value: any, options: any): void;
  watchSharedVar(sharedName: string, handler: Command): void;
  preUpdate(): void;
  postUpdate(): void;
  preUse(layer: Layer<any>): void;
  postUse(layer: Layer<any>): void;
  isInstanceOf(name: string): boolean;
}

export default interface ServiceConstructor {
  new (baseName: string, options: ServiceInitOption): InteractionService;

  register(baseName: string, options: ServiceInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: string, options: ServiceInitOption): InteractionService;
  findService(baseNameOrRealName: string): InteractionService[];
}

export function register(baseName: string, options: ServiceInitTemplate): void;
export function unregister(baseName: string): boolean;
export function initialize(
  baseName: string,
  options: ServiceInitOption
): InteractionService;
export function findService(baseNameOrRealName: string): InteractionService[];
