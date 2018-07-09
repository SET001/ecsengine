import { ISystem, System } from './system'
import { Entity } from './entity';
import { Component } from './component';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { mapSeries } from 'async'

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

	_addSystem<G, T extends System<G>>(system: T): Promise<T>{
		const systemClass = system.constructor as {new(args?): T}

		if (!system.groupComponents || !Object.values(system.groupComponents).length) system.groupComponents = {}
		if (this.systems.has(systemClass)) return Promise.resolve(this.systems.get(systemClass) as T)
		const hasComponents = filter((component: Component) => {
			if (!system.groupComponents || !Object.values(system.groupComponents).length) return false
			return component.entity.hasComponents(Object.values(system.groupComponents))
		})
		system.name = systemClass.name
		this.systems.set(systemClass, system)
		system.register(
			this.getEntitiesWithSystemComponents(system),
			this.componentAdded.pipe(hasComponents),
			this.componentRemoved.pipe(hasComponents),
			this
		)
		return Promise.resolve(system)
	}

	addSystem<G, T extends System<G>>(system: {new(args?): T} | T): Promise<T>	{
		if (typeof system === 'function'){
			return this._addSystem(new system())
		} else {
			return this._addSystem(system)
		}
	}

	addSystems(...systems: Array<{new(args?): System<any>}|System<any>>): Promise<System<any>[]> {
		return new Promise((resolve, reject)=>{
			mapSeries(systems, async (system, cb)=>{
				cb(null, await this.addSystem(system))
			}, (err, result)=>{
				resolve(result)
			})
		})
	}
	
	removeSystem(systemClass: {new(args?): System<any>}){
		if (!this.systems.has(systemClass)){
			this.systems.delete(systemClass)
		}
	}

	get<T, S extends System<T>>(system: {new(args?): S} | string): S{
		if (typeof system === 'string'){
			var res: System<T>
			this.systems.forEach(s=>{
				if (s.name === system){
					res = s
				}
			})
			return res as S
		} else {
			return this.systems.get(system) as S
		}
	}

	getEntitiesWithSystemComponents(system: System<any>): Entity[]{
		if (!system.groupComponents || !Object.values(system.groupComponents).length) return []
		return this.entities.filter((entity: Entity)=>entity.hasComponents(Object.values(system.groupComponents)))
	}

}