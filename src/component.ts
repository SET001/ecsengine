import { Entity } from ".";

export class Component {
	entity: Entity
	constructor(data?: any){
		if (data){
			Object.assign(this, data)
		}
	}
}