
const array = [1, 2, 3];
// console.log(array[-1]); // undefined because javascript sucks ass

const letters = ['a', 'b', 'c', 'd', 'e'];
const proxy = new Proxy(letters, {
    get(target, prop) {
        if (!isNaN(prop)) {
            prop = parseInt(prop, 10);
            if (prop < 0) {
                prop += target.length;
            }
        }
        return target[prop];
    }
});

console.log(proxy["1"]);
for (let i = -6; i < 6; i++) {
    console.log(proxy[i]);
}
// console.log(proxy[0]); // => 'a'
// console.log(proxy[-2]); // => 'e'
// console.log(proxy[-8]);