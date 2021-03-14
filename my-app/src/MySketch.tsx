import React from 'react';
import p5Types from "p5";
import Sketch from "react-p5";
import {Loop, FixedEdgeLine} from './linegrowth'

import {Box, Point} from 'js-quadtree';

let l = new FixedEdgeLine(
	0,0,4,0
)

interface MySketchProps {
	//Your component props
}

const MySketch: React.FC<MySketchProps> = (props: MySketchProps) => {

	//See annotations in JS for more information
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5.createCanvas(500, 500).parent(canvasParentRef);
		//p5.frameRate(20)
	};

	const draw = (p5: p5Types) => {
		//console.log()
		//p5.background(100);
        p5.noFill();
		p5.stroke(0);
		p5.strokeWeight(1);
		
		//p5.fill('red')
		let factor = 100;

		p5.beginShape();
		p5.curveVertex(l.points[0].x*100+100,l.points[0].y*100+100);

		l.points.forEach(p => {
			p5.curveVertex(p.x*100+100,p.y*100+100);
			p5.point(p.x*100+100,p.y*100+100);
		})

		p5.curveVertex(l.points[l.points.length-1].x*100+100,l.points[l.points.length-1].y*100+100);
		p5.endShape();


		// l.points.forEach(p => {
		// 	p5.strokeWeight(5);
		// 	p5.point(p.x*100+100,p.y*100+100);
		// });

		// [1,2,3,4,5,6,7,8].forEach(()=>{
		// 	l.subdivide(0.5);
		// 	l.smooth(0.5);
		// })
		
		//console.log(l.points)
		
	};

	function keyPressed(p5: p5Types) {
		if (p5.keyCode === p5.LEFT_ARROW) {
		  l.grow(1);
		} else if (p5.keyCode === p5.RIGHT_ARROW) {
			l.repell(0.1,1)
		} else if (p5.keyCode === p5.DOWN_ARROW) {
			l.noise(0.1)
			l.repell(0.01,10)
			l.subdivide(0.5)
			l.grow2(0.3);
			l.smooth(0.1);

			l.points = l.points.map(p => new Point(p.x,p.y+0.07))
		}
	  }

	return <Sketch setup={setup} draw={draw} keyPressed={keyPressed} />;
};

export default MySketch;