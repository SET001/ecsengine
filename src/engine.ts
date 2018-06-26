import { ISystem, System } from './system'
import { Entity } from './entity';
import { Component } from '.';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class Engine{
	systems: Map<{new(args?): ISystem}, System<any>> = new Map()
	entities: Entity[] = []
	componentAdded: Subject<Component> = new Subject()
	componentRemoved: Subject<Component> = new Subject()
	
	update(){
		this.systems.forEach((system, systemClass)=>{
			system.update()
		})
	}

	addEntity(entity: Entity){
		if (this.entities.find(e=>e.id === entity.id)) return false
		this.entities.push(entity)
		entity.components.forEach((component: Component)=>{
			this.componentAdded.next(component)
		})
	}

	removeEntity(entity: Entity){
		if (!this.entities.find(e=>e.id === entity.id)) return false
		entity.components.forEach((component: Component)=>{
			this.componentRemoved.next(component)
		})
		this.entities = this.entities.filter(e=>e.id !== entity.id)
	}

	addSystem<T>(systemClass: {new(args?): System<T>}): System<T>{
		if (!this.systems.has(systemClass)){
			const system: System<any> = new systemClass()
			const hasComponents = filter((component: Component) => component.entity.hasComponents(Object.values(system.groupComponents)))

			this.systems.set(systemClass, system)
			system.init(
				this.getEntitiesWithSystemComponents(system),
				this.componentAdded.pipe(hasComponents),
				this.componentRemoved.pipe(hasComponents)
			)
			return system
		}
	}
	
	removeSystem(systemClass: {new(): System<any>}){
		if (!this.systems.has(systemClass)){
			this.systems.delete(systemClass)
		}
	}

	getEntitiesWithSystemComponents(system: System<any>): Entity[]{
		return this.entities.filter((entity: Entity)=>entity.hasComponents(Object.values(system.groupComponents)))
	}

}