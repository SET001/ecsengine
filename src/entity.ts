import { Component } from "./component";
import { Subject } from "rxjs";

export class Entity{
	static _id: number = 0
	id: number = 0
	components: Map<{new(): Component}, Component> = new Map()
	componentAdded: Subject<Component>
	componentRemoved: Subject<Component>

	add(componentClass: {new(data?): Component}, data: any){
		if (this.components.has(componentClass)) return false;
		const component = new componentClass(data)
		component.entity = this
		this.components.set(componentClass, component)
		if (this.componentAdded){
			this.componentAdded.next(component)
		}
	}

	remove(componentClass: {new(data?): Component}){
		if (!this.components.has(componentClass)) return false;
		const component = this.components.get(componentClass);
		this.components.delete(componentClass)
		if(this.componentRemoved){
			this.componentRemoved.next(component)
		}
	}

	constructor(){
		this.id = Entity._id++
	}

	hasComponents(components: {new(): Component}[]): boolean{
		return components.reduce((count: number, component: {new(): Component})=>
			this.components.has(component)
				? ++count
				: count
		, 0) === components.length
	}
}