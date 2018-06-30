import { assert } from 'chai';
import { Entity, Component } from "../index";

class TestComponent extends Component{}
class FooComponent extends Component{
	constructor(public name: string ='lol'){super()}
}

describe('entity', ()=>{

	describe('constructor', ()=>{
		it('should create component with incrementing uniq id', ()=>{
			const entity1 = new Entity();
			const entity2 = new Entity();
			assert.notEqual(entity1.id, entity2.id);
		})
	})

	describe('add', ()=>{
		it('should override default values when creating component instance', ()=>{
			const entity = new Entity();
			const component = entity.add(FooComponent, {name: 'lil'});
			assert.equal(component.name, 'lil')
		})
	})
	describe('hasComponents', ()=>{
		it('should return false if no components', ()=>{
			const entity = new Entity();
			assert.isFalse(entity.hasComponents([TestComponent]))
		})

		it('should return false if requested component does not exist', ()=>{
			const entity = new Entity();
			entity.add(FooComponent, {});
			assert.isFalse(entity.hasComponents([TestComponent]))
		})

		it('should return true if requested component exists', ()=>{
			const entity = new Entity();
			entity.add(FooComponent, {});
			assert.isTrue(entity.hasComponents([FooComponent]))
		})

		it('should return true if all requested components exists', ()=>{
			const entity = new Entity();
			entity.add(FooComponent, {});
			entity.add(TestComponent, {});
			assert.isTrue(entity.hasComponents([FooComponent, TestComponent]))
		})

		it('should return false if not all requested components exists', ()=>{
			const entity = new Entity();
			entity.add(FooComponent, {});
			assert.isFalse(entity.hasComponents([FooComponent, TestComponent]))
		})

		it('should return false if component existed but was removed', ()=>{
			const entity = new Entity();
			entity.add(FooComponent, {});
			entity.remove(FooComponent);
			assert.isFalse(entity.hasComponents([FooComponent]))
		})
	})
})