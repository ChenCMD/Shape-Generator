import uuid from 'uuidjs';
import { ParamMetaData, Param, ParamValue, Parameter } from './Parameter';
import { IdentifiedPoint } from './Point';

export abstract class AbstractShapeNode<T extends { [key in P]: Param }, P extends string> {
    // Set<P>にしないのはAbstractShapeNode#setParameterでのvalidationが面倒になるため。
    private validateParams: Set<string>;
    private _uuid: string;
    private _pointSet: IdentifiedPoint[] = [];
    public isSelected = false;

    public constructor(
        private type: string,
        private readonly paramMetaData: ParamMetaData<T>,
        public name: string,
        private _params: ParamValue<T>
    ) {
        this.validateParams = new Set(Object.keys(paramMetaData));
        this._uuid = uuid.generate();
        this.updatePointSet();
    }

    public get uuid(): string {
        return this._uuid;
    }

    protected get params(): ParamValue<T> {
        return this._params;
    }

    public get pointSet(): IdentifiedPoint[] {
        return this._pointSet;
    }

    private isParameterKey(argName: string): argName is P {
        return this.validateParams.has(argName);
    }

    private isParameterValue(argName: P, v: unknown): v is T[P]['value'] {
        // normal | range -> number, pos -> { x: number, y: number };
        const type = this.paramMetaData[argName].type ?? 'normal';
        if (type === 'normal' || type === 'range') return typeof v === 'number';
        if (type === 'pos') return !!(typeof v === 'object' && v && 'x' in v && 'y' in v);
        return false;
    }

    public setParameter(argName: string, value: unknown): void {
        if (!this.isParameterKey(argName) || !this.isParameterValue(argName, value)) return;
        this._params[argName] = value;
        this.updatePointSet();
    }

    public getParameterMap(): [string, Parameter<Param>][] {
        const params: [string, Parameter<Param>][] = [];
        for (const key of Object.getOwnPropertyNames(this.params))
            params.push([key, { ...this.paramMetaData[key as keyof T], value: this.params[key as keyof T] } as Parameter<Param>]);

        return params;
    }

    private updatePointSet(): void {
        this._pointSet = this.generatePointSet(this.params);
    }

    protected abstract generatePointSet(params: ParamValue<T>): IdentifiedPoint[];

    public toExportObject(): string {
        return JSON.stringify({
            type: this.type,
            name: this.name,
            params: this.params
        });
    }
}