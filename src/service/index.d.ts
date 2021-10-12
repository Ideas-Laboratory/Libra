import { Command } from "../command";

type ServiceInitOption = {
  on: { [action: string]: Command };
  props: { [key: string]: any };
  preInitialize?: (service: ExternalService) => void;
  postInitialize?: (service: ExternalService) => void;
  preUpdate?: (service: ExternalService) => void;
  postUpdate?: (service: ExternalService) => void;
  preUse?: (service: ExternalService) => void;
  postUse?: (service: ExternalService) => void;
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
}

export default interface ServiceConstructor {
  new (baseName: string, options: ServiceInitOption): ExternalService;

  register(baseName: string, options: ServiceInitTemplate): void;
  initialize(baseName: string, options: ServiceInitOption): ExternalService;
  findService(baseNameOrRealName: string): ExternalService[];
}
