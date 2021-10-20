import { Command } from "../command";
import { Layer } from "../layer";

type ServiceInitOption = {
  name?: string;
  on?: { [action: string]: Command };
  props?: { [key: string]: any };
  preInitialize?: (service: ExternalService) => void;
  postInitialize?: (service: ExternalService) => void;
  preUpdate?: (service: ExternalService) => void;
  postUpdate?: (service: ExternalService) => void;
  preUse?: (service: ExternalService, layer: Layer<any>) => void;
  postUse?: (service: ExternalService, layer: Layer<any>) => void;
  [param: string]: any;
};

interface ServiceConstructor {
  new (baseName: string, options: ServiceInitOption): ExternalService;

  register(baseName: string, options: ServiceInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: string, options: ServiceInitOption): ExternalService;
  findService(baseNameOrRealName: string): ExternalService[];
}

type ServiceInitTemplate = ServiceInitOption & {
  constructor?: ServiceConstructor;
};

const registeredServices: { [name: string]: ServiceInitTemplate } = {};
const instanceServices: ExternalService[] = [];

export default class ExternalService {
  _baseName: string;
  _name: string;
  _userOptions: ServiceInitOption;
  _on: { [action: string]: Command };
  _props: { [key: string]: any };
  _preInitialize?: (service: ExternalService) => void;
  _postInitialize?: (service: ExternalService) => void;
  _preUpdate?: (service: ExternalService) => void;
  _postUpdate?: (service: ExternalService) => void;
  _preUse?: (service: ExternalService, layer: Layer<any>) => void;
  _postUse?: (service: ExternalService, layer: Layer<any>) => void;

  constructor(baseName: string, options: ServiceInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._on = options.on ?? {};
    this._props = options.props ?? {};
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preUpdate = options.preUpdate ?? null;
    this._postUpdate = options.postUpdate ?? null;
    this._preUse = options.preUse ?? null;
    this._postUse = options.postUse ?? null;
    options.postInitialize && options.postInitialize.call(this, this);
  }

  on(action: string, command: Command): void {}
}
