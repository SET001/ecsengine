import { Component } from './component'
import { Observable } from 'rxjs'
import { Entity } from './entity'

export interface ISystem{
	targets: any
	update()
}

export class System implements ISystem{
	targets: any
	components: any[]
	update(){}
	componentAdded: Observable<Component>
	componentRemoved: Observable<Component>
	add(){}
	remove(){}
}