function _call(Fn, obj, ...args) {
  //如果obj为null或者undefined则指向全局对象
  if (obj === undefined || obj === null) {
    obj = globalThis;
  }
  //为obj添加临时的方法
  obj.temp = Fn;
  //调用temp方法
  let result = obj.temp(...args);
  //删除temp方法
  delete obj.temp;
  //返回执行结果
  return result;
}

function myAdd(num1, num2) {
  return num1 + num2 + this.num3;
}

let obj = {
  num3: 1000,
};

// console.log(_call(myAdd, obj, 10, 100)); //1110

global.num3 = 10000;
// console.log(_call(myAdd, null, 10, 100)); //10110

// function _apply(Fn, obj, args) {
//   //如果obj为null或者undefined则指向全局对象
//   if (obj === undefined || obj === null) {
//     obj = globalThis;
//   }
//   //为obj添加临时的方法
//   obj.temp = Fn;
//   //调用temp方法
//   let result = obj.temp(...args);
//   //删除temp方法
//   delete obj.temp;
//   //返回执行结果
//   return result;
// }

// console.log(_apply(myAdd, obj, [10, 100])); //1110
// console.log(_apply(myAdd, null, [10, 100])); //10110

function _bind(Fn, obj, ...args) {
  //返回一个新函数
  return function (...args2) {
    return _call(Fn, obj, ...args, ...args2);
  };
}

let myBind = _bind(myAdd, obj, 1, 2);
console.log(myBind(10, 100)); //1003

function getPhoneNumber(phoneNumber) {
  let result = "";
  //截取前两位
  let part1 = phoneNumber.slice(0, 2);
  if (part1 === "90") {
    //外地手机号码
    result = phoneNumber.slice(2);
  } else if (part1 !== "") {
    //本地手机号+固话
    result = phoneNumber.slice(1);
  }
  return result;
}

console.log(getPhoneNumber("9017717929150"));
console.log(getPhoneNumber("917717929150"));
