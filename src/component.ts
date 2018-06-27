import { Entity } from "./entity";

export class Component {
	entity: Entity
	constructor(data?: any){
		if (data){
			Object.assign(this, data)
		}
	}
}