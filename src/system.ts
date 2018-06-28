import { Component } from './component'
import { Observable } from 'rxjs'
import { Entity } from './entity'

export interface ISystem{
	update()
}

export function componentsGroup(constructor){
	const obj = new constructor()
	return function (target){
		target.prototype.groupComponents = {}
		Object.entries(obj).forEach(
			([key, value]) => target.prototype.groupComponents[key] = value.constructor
		)
	}
}

export type ComponentsGroupDefinition = {[s: string]: {new(): Component}}

export class System<T>{
	componentGroups: Map<number, T> = new Map()
	groupComponents: ComponentsGroupDefinition

	constructor(groupComponents?: T){
		if (groupComponents){
			this.setGroupComponents(groupComponents)
		}
	}

	setGroupComponents(groupComponents: T){
		Object.entries(groupComponents).forEach(
			([key, value]) => this.groupComponents[key] = value.constructor
		)
	}

	update(){
		this.componentGroups.forEach(context=>this.execute(context))
	}

	execute(context: T){}
	componentAdded: Observable<Component>
	componentRemoved: Observable<Component>

	add(component: Component){
		if (this.componentGroups.has(component.entity.id)) return false
		const group: T = this.getComponentsGroupFromEntity(component.entity)
		this.addComponentsGroup(group, component.entity)
	}

	addComponentsGroup(group: T, entity: Entity){
		if (this.componentGroups.has(entity.id)) return false
		this.componentGroups.set(entity.id, group)
		this.onNewGroup(group, entity)
	}

	onNewGroup(group: T, entity: Entity){}

	getComponentsGroupFromEntity(entity: Entity){
		const group: T = {} as T
		Object.entries(this.groupComponents).forEach(
			([key, value]) => group[key] = entity.components.get(value)
		)
		return group
	}
	remove(entity: Entity){

	}

	init(entities: Entity[], componentAdded: Observable<Component>, componentRemoved: Observable<Component>){
		entities.map(entity=>{
			this.addComponentsGroup(this.getComponentsGroupFromEntity(entity), entity)
		})
		this.componentAdded = componentAdded
		this.componentRemoved = componentRemoved
		componentAdded.subscribe(this.add.bind(this))
		componentRemoved.subscribe(this.remove.bind(this))
	}
}