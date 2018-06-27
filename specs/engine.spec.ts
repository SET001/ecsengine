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
class TestSystem<T extends TestSystemGroup> extends System<T>{}

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

	describe('addSystem', ()=>{
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