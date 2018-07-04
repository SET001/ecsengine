import { ISystem, System } from './system'
import { Entity } from './entity';
import { Component } from './component';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class Engine{
	systems: Map<{new(args?): System<any>}, System<any>> = new Map()
	entities: Entity[] = []
	componentAdded: Subject<Component> = new Subject()
	componentRemoved: Subject<Component> = new Subject()
	
	update(){
		this.systems.forEach(system=>{
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

	_addSystem<G, T extends System<G>>(system: T): T{
		const systemClass = system.constructor as {new(args?): T}
		if (this.systems.has(systemClass)) return this.systems.get(systemClass) as T
		const hasComponents = filter((component: Component) => component.entity.hasComponents(Object.values(system.groupComponents)))
		system.name = systemClass.name
		this.systems.set(systemClass, system)
		system.init(
			this.getEntitiesWithSystemComponents(system),
			this.componentAdded.pipe(hasComponents),
			this.componentRemoved.pipe(hasComponents)
		)
		return system
	}

	addSystem<G, T extends System<G>>(system: {new(args?): T} | T): T	{
		if (typeof system === 'function'){
			return this._addSystem(new system())
		} else {
			return this._addSystem(system)
		}
	}

	addSystems(...systems: Array<{new(args?): System<any>}|System<any>>): System<any>[] {
		return systems.map((system: System<any>)=>{
			return this.addSystem(system)
		})
	}
	
	removeSystem(systemClass: {new(args?): System<any>}){
		if (!this.systems.has(systemClass)){
			this.systems.delete(systemClass)
		}
	}

	get<T>(system: {new(args?): System<T>} | string): System<T>{
		if (typeof system === 'string'){
			var res: System<T>
			this.systems.forEach(s=>{
				if (s.name === system){
					res = s
				}
			})
			return res
		} else {
			return this.systems.get(system)
		}
	}

	getEntitiesWithSystemComponents(system: System<any>): Entity[]{
		return this.entities.filter((entity: Entity)=>entity.hasComponents(Object.values(system.groupComponents)))
	}

}