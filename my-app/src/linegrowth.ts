import {QuadTree, Box, Point, Circle} from 'js-quadtree';
import p5Types from "p5";
import _ from "lodash";

function window(a: Array<any>, sz: number) {
    return a.map((_, i, ary) => ary.slice(i, i + sz)).slice(0, -sz + 1);
}

function distance(a:Point, b:Point){
    return Math.sqrt(Math.pow((a.x-b.x),2) + Math.pow((a.y-b.y),2));
}

function magn(v:number[]){
    return Math.sqrt(Math.pow((v[0]),2) + Math.pow((v[1]),2));
}

function norm(v:number[]){
    let r = Math.sqrt(Math.pow((v[0]),2) + Math.pow((v[1]),2));
    return [v[0]/r, v[1]/r];
}

function dot(v1:number[], v2:number[]){
    return v1[0]*v2[0] + v1[1]*v2[1];
}

export class FixedEdgeLine{
    points: Point[]
    constructor(x1:number,y1:number,x2:number,y2:number){
        this.points = [new Point(x1,y1), new Point(x2,y2)];
    }

    subdivide(max: number){

        let i = 0
        while (i < this.points.length-1) {

            let a = this.points[i];
            let b = this.points[i+1];

            if (distance(a,b) > max){
                this.points.splice(i+1,0,new Point((a.x+b.x)/2,(a.y+b.y)/2));
            } else {
                i++;
            }
        }

    }

    smooth(factor: number){

        let pts = [...this.points];
        let first = pts[0];
        let last = pts[pts.length-1];
        
        this.points = [first].concat(window(pts,3).map((w: Point[]) => {
                        let inbetween = [(w[0].x + w[2].x)/2, (w[0].y + w[2].y)/2];
                        let displace = [inbetween[0] - w[1].x, inbetween[1] - w[1].y];
                        return new Point(w[1].x+displace[0]*factor, w[1].y+displace[1]*factor);
                    })).concat([last]);
    }

    grow(p:number){

        let first = this.points[0];
        let last = this.points[this.points.length-1];

        let new_pts = [];
        
        new_pts.push(this.points[0])
        window(this.points,3).map((w: Point[], i) => {

            let v1 = [w[0].x - w[1].x, w[0].x - w[1].x]; 
            let v2 = [w[2].x - w[1].x, w[2].x - w[1].x];

            let angle = Math.acos((v1[0]*v2[0] + v1[1]*v2[1]) / (magn(v1)*magn(v2))) //α = arccos[(a · b) / (|a| * |b|)]
            
            if (Math.random()*2*Math.PI*p > angle){
                console.log([(w[0].x + w[1].x)/2, (w[0].y + w[1].y)/2])
                //insert new point
                new_pts.push(new Point((w[0].x + w[1].x)/2, (w[0].y + w[1].y)/2));
            }

            new_pts.push(w[1]);

        });

        new_pts.push(this.points[this.points.length-1])

        this.points = new_pts;

    }

    grow2(max:number){
        let indexes = _.sampleSize(Array.from(Array(this.points.length -1).keys()) ,Math.round(this.points.length*max))

        let new_pts = [];
        
        new_pts.push(this.points[0])

        window(this.points,3).map((w: Point[], i) => {

            let v1 = [w[0].x - w[1].x, w[0].x - w[1].x]; 
            let v2 = [w[2].x - w[1].x, w[2].x - w[1].x];

            let angle = Math.acos((v1[0]*v2[0] + v1[1]*v2[1]) / (magn(v1)*magn(v2))) //α = arccos[(a · b) / (|a| * |b|)]
            
            if (Math.random()*2*Math.PI > angle && indexes.includes(i)){
                //console.log([(w[0].x + w[1].x)/2, (w[0].y + w[1].y)/2])
                //insert new point
                new_pts.push(new Point((w[0].x + w[1].x)/2, (w[0].y + w[1].y)/2));
            }

            new_pts.push(w[1]);

        });

        new_pts.push(this.points[this.points.length-1])

        this.points = new_pts;
    }

    repell(factor: number, radius:number, pts: Point[] = this.points){
        //Build quadtree
        let qt = new QuadTree(new Box(0,0,1,1,));
        qt.insert(pts);

        let new_points = [...this.points].map(p=>{


            let nearby = qt.query(new Circle(p.x, p.y, radius));

            let displace = nearby.map(nearby_p =>{

                if (nearby_p === p){
                    return [0,0]

                } else{

                    let delta = [p.x - nearby_p.x, p.y - nearby_p.y];
                    let r = distance(nearby_p,p);

                    //console.log(delta.map(d => d/(Math.pow(r,2))))

                    return delta.map(d => d/((Math.pow(r,2))))
                }
            }).reduce((a, b) => [a[0] + b[0], a[1] + b[1]] , [0,0])

            return new Point(p.x + factor*displace[0], p.y + factor*displace[1]);
        })

        new_points[0] = this.points[0];

        new_points[new_points.length-1] = this.points[this.points.length-1]
        this.points = new_points;

        
    }

    noise(amount:number){
        this.points = this.points.map(p=> new Point(p.x+(Math.random()-0.5)*amount ,p.y+(Math.random() - 0.5)*amount ));
    }
}

function repell(points: Point[]){

}




export class Loop{
    points: Point[]
    constructor(points: Point[]){
        this.points = points;
    }

    subdivide(max: number){

        let i = 0
        while (i < this.points.length) {

            let a = this.points[i];
            let b = this.points[ (i+1)%(this.points.length)];

            if (distance(a,b) > max){
                this.points.splice((i+1)%(this.points.length+1),0,new Point((a.x+b.x)/2,(a.y+b.y)/2));
            } else {
                i++;
            }
        }

    }

    smooth(factor: number){

        //add padding
        let pts : Point[] = this.points.slice();
        let first = pts[0]
        let last = pts[pts.length-1]
        pts.push(first);
        pts = [last].concat(pts);
        
        this.points = window(pts,3).map((w: Point[]) => {
                        let inbetween = [(w[0].x + w[2].x)/2, (w[0].y + w[2].y)/2];
                        let displace = [inbetween[0] - w[1].x, inbetween[1] - w[1].y];
                        return new Point(w[1].x+displace[0]*factor, w[1].y+displace[1]*factor);
                    })
    }

    repell(factor: number, radius: number){

        //Build quadtree
        let qt = new QuadTree(new Box(0,0,1,1,));
        qt.insert(this.points);

        this.points = [...this.points].map(p=>{


            let nearby = qt.query(new Circle(p.x, p.y, radius));

            let displace = nearby.map(nearby_p =>{

                if (nearby_p === p){
                    return [0,0]

                } else{

                    let delta = [p.x - nearby_p.x, p.y - nearby_p.y];
                    let r = distance(nearby_p,p);

                    //console.log(delta.map(d => d/(Math.pow(r,2))))

                    return delta.map(d => d/((Math.pow(r,2))))
                }
            }).reduce((a, b) => [a[0] + b[0], a[1] + b[1]] , [0,0])


            return new Point(p.x + factor*displace[0], p.y + factor*displace[1]);
        })

        
    }
}
// class LineGrowth{
//     quadtree: QuadTree;
//     line: Point[];
//     radius:number;
//     time:number;
//     repulsion: number;
//     smoothing: number;

//     constructor(line: Point[], radius:number, bound:Box){
//         this.quadtree = new QuadTree(bound);
//         this.quadtree.insert(line);

//         this.radius = radius;

//         this.line = line;
//         this.time = 0;

//         this.repulsion = 0.1;
//         this.smoothing = 0.1;
//     }

//     tick(){
//         this.time += 1;

//         console.log('At start:')
//         console.log(this.line)
//         console.log()

//         //Diffuse
//         this.line = this.line.map(p=>{
           
//             let nearby = this.quadtree.query(new Circle(p.x, p.y, this.radius));
//             console.log('Nearby:')
//             console.log(nearby)

//             let displace = nearby.map(nearby_p =>{
//                 let delta = [nearby_p.x -p.x, nearby_p.y -p.y,];
//                 let r = Math.sqrt(delta[0]**2+delta[1]**2);

//                 return delta.map(d => d/(r**2))
//             }).reduce((a, b) => [a[0] + b[0], a[1] + b[1]],[0,0])

//             return new Point(p.x + this.repulsion*displace[0], p.y + this.repulsion*displace[1]);
//         })

//         console.log('Diffused:')
//         console.log(this.line)
//         console.log()

//         //Smooth
//         // this.line = window(this.line.slice(),3).map((w: Point[]) => {
//         //     let displace = [w[1].x - (w[0].x + w[2].x)/2,w[1].y - (w[0].y + w[2].y)/2];
//         //     return new Point(w[1].x + this.smoothing*displace[0], w[1].y + this.smoothing*displace[1])
//         // })

//         console.log('Smoothed:')
//         console.log(this.line)
//         console.log()

//         //Subdivide
//         this.line = window(this.line.slice(),2).map((w: Point[]) => {
//             let delta = [w[0].x - w[1].x, w[0].y - w[1].y];
//             let r = Math.sqrt(delta[0]**2+delta[1]**2);
//             if (r<this.radius/3){
//                 let inbetween = [(w[0].x + w[1].x)/2, (w[0].y + w[1].y)/2]

//                 return [w[0],new Point(inbetween[0], inbetween[1]), w[1]]
//             } else return w;
//         }).reduce((newArray, item) => {
//             item.forEach(e => newArray.push(e))
//             return newArray;}
//             ,[]);
        
//         console.log('Subdivided:')
//         console.log(this.line)
//         console.log()
//         console.log()

//         this.quadtree.clear();
//         this.quadtree.insert(this.line);
//     }

// }

// export default LineGrowth;