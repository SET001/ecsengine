import "reflect-metadata";
import { Engine, System, Component, Entity, componentsGroup } from '../index'
import { assert } from 'chai'
import * as sinon from 'sinon';


class TestComponent extends Component{}
class FooComponent extends Component{
	constructor(public name: string =''){super()}
}

class TestSystemGroup {
	test: TestComponent = new TestComponent()
	foo: FooComponent = new FooComponent()
}

@componentsGroup(TestSystemGroup)
class TestSystem extends System<TestSystemGroup>{
	constructor(public age: number){super()}

	init(){
		return new Promise((resolve, reject)=>{
			setTimeout(()=>{
				console.log(`${this.constructor.name} initialised`)
				resolve()
			}, 1000)
		})
	}
}

class FooSystemGroup {
	foo: FooComponent = new FooComponent()
}
@componentsGroup(FooSystemGroup)
class FooSystem extends System<FooSystemGroup>{
	foo: string
	init(){
		return new Promise((resolve, reject)=>{
			setTimeout(()=>{
				console.log(`${this.constructor.name} initialised`)
				resolve()
			}, 500)
		})
	}
}

class TestEntity extends Entity{
	constructor(){
		super()
		this.add(FooComponent, {name: 'lol'} as FooComponent)
		this.add(TestComponent, {} as TestComponent)
	}
}

class WrongSystem extends System<any>{}

describe('Engine', ()=>{

	var engine: Engine
	beforeEach(()=>{
		engine = new Engine()
	})

	describe('get', ()=>{
		it('should return system by class', ()=>{
			engine.addSystem(new FooSystem())
			const system = engine.get(FooSystem)
			assert.equal(system.constructor, FooSystem)
		})

		it('should return system by name', ()=>{
			engine.addSystem(new FooSystem())
			const system = engine.get('FooSystem')
			assert.isDefined(system)
			assert.equal(system.constructor, FooSystem)
		})
	})

	describe('addSystem', ()=>{
		describe('wrong system', ()=>{
			it('should allow systems with no group components set', async()=>{
				const [wrongSystem, testSystem] = await engine.addSystems(WrongSystem, TestSystem)
				assert.isDefined(wrongSystem)
				assert.isDefined(testSystem)
				assert.equal(testSystem.constructor, TestSystem)
				assert.equal(wrongSystem.constructor, WrongSystem)
			})
		})
		describe('signatures', ()=>{
			it('single instanse', async ()=>{
				const system = await engine.addSystem(new FooSystem())
				assert.isDefined(system)
				assert.equal(system.constructor, FooSystem)
			})

			it('single constructor', async ()=>{
				const system = await engine.addSystem(FooSystem)
				assert.equal(system.constructor, FooSystem)
			})

			it('multiple instances', async ()=>{
				const [testSystem, fooSystem] = await engine.addSystems(
					new TestSystem(23),
					new FooSystem()
				)
				assert.equal((testSystem as TestSystem).age, 23)
				assert.equal(fooSystem.constructor, FooSystem)
				assert.equal(testSystem.constructor, TestSystem)
			})

			it('multiple constructors', async ()=>{
				const [testSystem, fooSystem] = await engine.addSystems(TestSystem,	FooSystem)
				assert.equal(fooSystem.constructor, FooSystem)
				assert.equal(testSystem.constructor, TestSystem)
			})

			it('mixed instances and constructors', async ()=>{
				const [testSystem, fooSystem] = await engine.addSystems(TestSystem,	new FooSystem())
				assert.equal(fooSystem.constructor, FooSystem)
				assert.equal(testSystem.constructor, TestSystem)
			})
		})

		it('should add system instanse to hasmap', ()=>{
			engine.addSystem(TestSystem)
			assert.isTrue(engine.systems.has(TestSystem))
		})

		it('should add existing components', ()=>{
			engine.addEntity(new TestEntity())
			engine.addSystem(TestSystem)
			const system = engine.systems.get(TestSystem)
			assert.equal(system.componentGroups.size, 1)
		})

		it('it should get matching added components throught observable object', async ()=>{
			const onComponentAdded = sinon.spy()
			const system = await engine.addSystem(TestSystem)
			engine.componentAdded.subscribe(onComponentAdded)
			engine.addEntity(new TestEntity())
			assert.isTrue(onComponentAdded.called)
			assert.equal(system.componentGroups.size, 1)
		})

		it('it should not get not-matching added components throught observable object', async ()=>{
			const onComponentAdded = sinon.spy()
			const system = await engine.addSystem(TestSystem)
			system.componentAdded.subscribe(onComponentAdded)
			const entity = new TestEntity();
			entity.remove(TestComponent);
			engine.addEntity(entity)
			assert.isFalse(onComponentAdded.called)
		})
	})

	describe('addEntity', ()=>{
		var entity
		beforeEach(()=>{
			entity = new TestEntity()
			engine.addEntity(entity)
		})

		it ('should add entity', ()=>{
			assert.equal(engine.entities.length, 1)
		})

		it ('should not add entity twice', ()=>{
			engine.addEntity(entity)
			engine.addEntity(entity)
			engine.addEntity(entity)
			assert.equal(engine.entities.length, 1)
		})
	})

	describe('removeEntity', ()=>{
		var entity
		beforeEach(()=>{
			entity = new TestEntity()
			engine.addEntity(entity)
			engine.removeEntity(entity)
		})

		it ('should remove entity', ()=>{
			assert.equal(engine.entities.length, 0)
		})
	})
})