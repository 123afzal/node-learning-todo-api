/**
 * Created by Syed Afzal
 */
let addTwoNumber = (n1, n2) =>{
    return new Promise((resolve, reject)=>{
        if(typeof n1 === 'number' && typeof n2 === 'number'){
            // console.log(n1 ,n2)
            resolve(n1+n2)
        }
        reject("Input must be valid numbers")
    })
}

addTwoNumber(1,2).then((res)=>{
    console.log(res)
    addTwoNumber(res,'2').then((res)=>{
        console.log(res)
        addTwoNumber(res,2).then((res)=>{
            console.log(res)
        })
    })
}).catch((e)=> console.log('This is th error case : ', e))