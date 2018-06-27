# ecsengine
Simple Entity-Component-System (ECS) engine for JavaScript written in TypeScript.

# Install

`npm install ecsengine --save`

# Usage
1. Create an instance of engine

```TypeScript
import { Engine } from 'ecsengine'
const engine = new Engine()
```

2. Define your components. The components are just to store data. It does not have to contain any logic. According to ECS paradigm - you store all your logic in System's code.

```TypeScript
class PositionComponent extends Component{
	x: number = 0
	y: number = 0
	z: number = 0
}

class PhysicComponent extends Component{}
```
Component may be an empty class - just to point that entity with that component have some behavior.

3. Define component group for system. Each system interested in work with entity that have some set of components.

```TypeScript
class PhysicComponentGroup{
	position: PositionComponent = new PositionComponent()
	physic: PhysicComponent = new PhysicComponent()
}
```

4. Define system and describe your logic there:

```TypeScript
@componentsGroup(PhysicComponent)
class PhysicSystem extends System<PhysicComponentGroup>{
	execute(content: PhysicComponentGroup){
		content.position.x -= 9.8
	}
}
```
Also note that this code use decorators so you must have `"experimentalDecorators": true,` in your `tsconfig.json`
