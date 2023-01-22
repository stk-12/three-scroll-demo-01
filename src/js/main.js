import '../css/style.scss'
import * as THREE from "three";
import Lenis from '@studio-freight/lenis';
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"


class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector("#canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.scene = new THREE.Scene();
    this.camera = null;
    this.mesh = null;

    // this.controls = null;

    this.lenis = new Lenis({
      duration: 2.0,
      // easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // direction: 'vertical', // vertical, horizontal
      // gestureDirection: 'vertical', // vertical, horizontal, both
      // smooth: true,
      // mouseMultiplier: 1,
      // smoothTouch: false,
      // touchMultiplier: 2,
      // infinite: false,
    });

    
    // scroll animation
    this.animations = [];
    this.scrollPercent = 0;


    this._init();
    this._update();
    this._addEvent();
    this._addAnimations();


    // lenis
    this._getScrollValue();
  }

  _setCamera() {
    // this.camera = new THREE.PerspectiveCamera(45, this.viewport.width / this.viewport.height, 1, 100);
    // this.camera.position.set(0, 0, 5);
    // this.scene.add(this.camera);

    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = (this.viewport.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.width / this.viewport.height, 1, distance * 2);
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  // _setControlls() {
  //   this.controls = new OrbitControls(this.camera, this.canvas);
  //   this.controls.enableDamping = true;
  // }

  _setLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  }

  _addMesh() {
    const geometry = new THREE.BoxGeometry(50, 50, 50);
    const material = new THREE.MeshStandardMaterial({color: 0x444444});
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  _getScrollValue() {
    this.lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
      console.log({ scroll, limit, velocity, direction, progress })
    })
  }

  _addAnimations() {
    this.animations.push({
      start: 0,
      end: 40,
      animation() {
        this.camera.lookAt(this.mesh.position);
        // this.camera.position.set();
        // this.mesh.position.z += 0.1;
        this.mesh.position.z = lerp(0, 500, scalePercent(this.scrollPercent, 0, 40));
      },
    });

    this.animations.push({
      start: 40,
      end: 50,
      animation() {
        this.camera.lookAt(this.mesh.position);
        this.mesh.rotation.y = lerp(0, radian(360), scalePercent(this.scrollPercent, 40, 50));
      },
    });

    this.animations.push({
      start: 50,
      end: 100,
      animation() {
        this.camera.lookAt(this.mesh.position);
        // this.mesh.rotation.y = lerp(0, radian(360), scalePercent(this.scrollPercent, 40, 50));
        // this.camera.position.x = lerp(0, 300, scalePercent(this.scrollPercent, 50, 70));
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
      },
    });
  }

  _startAnimations() {
    this.animations.forEach((animation)=>{
      if(this.scrollPercent >= animation.start && this.scrollPercent <= animation.end) {
        animation.animation.call(this);
      }
    });
  }

  _onScroll() {
    this.scrollPercent = (scrollY / (document.body.scrollHeight - this.viewport.height)) * 100; // 進捗率の算出
    console.log(this.scrollPercent);
  }



  _init() {
    this._setCamera();
    // this._setControlls();
    this._setLight();
    this._addMesh();
  }

  _update(time) {

    this.lenis.raf(time);

    this._startAnimations();
    
    // this.mesh.rotation.y += 0.01;
    // this.mesh.rotation.x += 0.01;

    //レンダリング
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();
    requestAnimationFrame(this._update.bind(this));
  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));

    window.addEventListener('scroll', this._onScroll.bind(this));
  }
}

new Main();


// 線形補間
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}


function scalePercent(scrollPercent, start, end) {
  return (scrollPercent - start) / (end - start);
}


// ラジアンに変換
function radian(val) {
  return (val * Math.PI) / 180;
}

// ランダムな数
// function random(min, max) {
//   return Math.random() * (max - min) + min;
// }

