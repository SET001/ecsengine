import { ISystem, System } from './system'
import { Entity } from './entity';
import { Component } from '.';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class Engine{
	systems: Map<{new(): System}, System> = new Map()
	entities: Entity[] = []
	// entityAdded: Subject<Entity> = new Subject()
	// entityRemoved: Subject<Entity> = new Subject()
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

	addSystem(systemClass: {new(): System}): System{
		if (!this.systems.has(systemClass)){
			const system: System = new systemClass()
			const hasComponents = filter((component: Component) => component.entity.hasComponents(Object.values(system.targets)))

			this.systems.set(systemClass, system)

			system.componentAdded = this.componentAdded.pipe(hasComponents)
			system.componentRemoved = this.componentRemoved.pipe(hasComponents)
			system.components = this.getEntitiesWithSystemComponents(system)
			return system
		}
	}
	
	removeSystem(systemClass: {new(): System}){
		if (!this.systems.has(systemClass)){
			this.systems.delete(systemClass)
		}
	}

	getEntitiesWithSystemComponents(system: System): Entity[]{
		return this.entities.filter((entity: Entity)=>entity.hasComponents(Object.values(system.targets)))
	}

}