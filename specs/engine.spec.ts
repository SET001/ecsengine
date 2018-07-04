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
	age: number
	constructor(public name: string){super()}
}

class FooSystemGroup {
	foo: FooComponent = new FooComponent()
}
@componentsGroup(FooSystemGroup)
class FooSystem extends System<FooSystemGroup>{
	foo: string
}

class TestEntity extends Entity{
	constructor(){
		super()
		this.add(FooComponent, {name: 'lol'} as FooComponent)
		this.add(TestComponent, {} as TestComponent)
	}
}

class WrongSystem{}

describe('Engine', ()=>{

	var engine: Engine
	beforeEach(()=>{
		engine = new Engine()
	})

	describe('get', ()=>{
		it('should return system', ()=>{
			engine.addSystem(new FooSystem())
			const system = engine.get(FooSystem)
			assert.equal(system.constructor, FooSystem)
		})
	})

	describe('addSystem', ()=>{
		describe('signatures', ()=>{
			it('single instanse', ()=>{
				const system = engine.addSystem(new FooSystem())
				assert.equal(system.constructor, FooSystem)
			})

			it('single constructor', ()=>{
				const system = engine.addSystem(FooSystem)
				assert.equal(system.constructor, FooSystem)
			})

			it('multiple instances', ()=>{
				const [testSystem, fooSystem] = engine.addSystems(
					new TestSystem('blah'),
					new FooSystem()
				)
				assert.equal((testSystem as TestSystem).name, 'blah')
				assert.equal(fooSystem.constructor, FooSystem)
				assert.equal(testSystem.constructor, TestSystem)
			})

			it('multiple constructors', ()=>{
				const [testSystem, fooSystem] = engine.addSystems(TestSystem,	FooSystem)
				assert.equal(fooSystem.constructor, FooSystem)
				assert.equal(testSystem.constructor, TestSystem)
			})

			it('mixed instances and constructors', ()=>{
				const [testSystem, fooSystem] = engine.addSystems(TestSystem,	new FooSystem())
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

		it('it should get matching added components throught observable object', ()=>{
			const onComponentAdded = sinon.spy()
			const system = engine.addSystem(TestSystem)
			engine.componentAdded.subscribe(onComponentAdded)
			engine.addEntity(new TestEntity())
			
			assert.isTrue(onComponentAdded.called)
			assert.equal(system.componentGroups.size, 1)
		})

		it('it should not get not-matching added components throught observable object', ()=>{
			const onComponentAdded = sinon.spy()
			const system = engine.addSystem(TestSystem)
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