const dotLen = 3;    // 精确度保留3位小数点（可以按需修改此数值）

type DecimalSign = 1 | -1;
type intNum = number;
let scale = Math.pow(10, dotLen);

export class Decimal {
    sign: DecimalSign = 1;      // 符号位
    v1: intNum = 0;             // 商
    v2: intNum = 0;             // 余

    /**
     * 传入字符串数字
     * @param strNum 字符串数字
     */
    constructor(strNum: string)
    /**
     * 传入整数数字
     * @param intNum 整数数字
     */
    constructor(intNum: intNum)
    /**
     * 传入 符号位，商，余   （外部最好不要调用此构造）
     * @param sign 符号位 1 / -1
     * @param v1 商 （>=0）
     * @param v2 余 （>=0）
     */
    constructor(sign: DecimalSign, v1: intNum, v2: intNum)
    /**
     * 构造 0
     */
    constructor()
    constructor(...args: any[]) {
        if (args.length === 3) {
            this.sign = args[0];
            this.v1 = args[1];
            this.v2 = args[2];
            if (this.v2 >= scale) {
                throw new Error("Decimal v2 too big -- " + this.v2);
            }
            if (this.v1 === 0 && this.v2 === 0) {
                this.sign = 1;
            }
            return;
        }

        if (args.length === 0) {
            return;
        }

        if (args.length === 1) {
            if (typeof args[0] === "number") {
                if (args[0].toString().indexOf(".") !== -1) {
                    throw new Error("Decimal need an int number -- " + args[0]);
                }
                if (args[0] >= 0) {
                    this.sign = 1;
                    this.v1 = args[0];
                } else {
                    this.sign = -1;
                    this.v1 = -args[0];
                }
            } else {
                if ((args[0] as string).length === 0) {
                    return;
                }
                let strArr = (args[0] as string).split(".");
                this.sign = strArr[0][0] === "-" ? -1 : 1;
                this.v1 = parseInt(strArr[0]);
                if (this.sign === -1) {
                    this.v1 = -this.v1;
                }
                if (strArr[1]) {
                    this.v2 = parseInt(strLen(strArr[1]));
                }
                if (this.v1 === 0 && this.v2 === 0) {
                    this.sign = 1;
                }
            }
        }
    }

    /**
     * 0
     */
    static get ZERO() {
        return new Decimal();
    }

    /**
     * 0 （唯一的，不要修改此值，主要用作比较大小）
     */
    static get ZERO_R() {
        return ZERO_decimal;
    }

    /**
     * 转为浮点数
     */
    toNumber(): number {
        return this.sign * (this.v1 + this.v2 / scale);
    }

    /**
     * 转为字符串
     */
    toString(): string {
        if (this.sign === 1) {
            return this.v1.toString() + "." + "0".repeat(dotLen - this.v2.toString().length) + this.v2;
        }
        return "-" + this.v1.toString() + "." + "0".repeat(dotLen - this.v2.toString().length) + this.v2;
    }

    /**
     * 转为大整数
     */
    getHugeValue(): number {
        return this.sign * (this.v1 * scale + this.v2);
    }

    /**
     * 克隆
     */
    clone(): Decimal {
        return new Decimal(this.sign, this.v1, this.v2);
    }

    /**
     * 向下取整
     */
    floor(): number {
        return this.sign * this.v1;
    }

    /**
     * 向上取整
     */
    ceil(): number {
        return this.sign * (this.v1 + (this.v2 > 0 ? 1 : 0));
    }

    /**
     * 四舍五入
     */
    round(): number {
        return this.sign * (this.v1 + (this.v2 > scale >> 1 ? 1 : 0));
    }

    /**
     * 相反数
     */
    reverse(): Decimal {
        return new Decimal(-this.sign as DecimalSign, this.v1, this.v2);

    }

    /**
     * 加法
     * @param other 
     */
    add(other: Decimal): Decimal {
        let num = this.getHugeValue() + other.getHugeValue();
        let sign: DecimalSign = 1;
        if (num < 0) {
            sign = -1;
            num = -num;
        }
        let res = getShangYu(num, scale);
        return new Decimal(sign, res.shang, res.yu);
    }

    /**
     * 加法，赋值自己
     * @param other 
     */
    addSelf(other: Decimal): Decimal {
        let tmp = this.add(other);
        this.sign = tmp.sign;
        this.v1 = tmp.v1;
        this.v2 = tmp.v2;
        return this;
    }

    /**
     * 减法
     * @param other 
     */
    sub(other: Decimal): Decimal {
        return this.add(other.reverse());
    }

    /**
     * 减法，赋值自己
     * @param other 
     */
    subSelf(other: Decimal): Decimal {
        let tmp = this.sub(other);
        this.sign = tmp.sign;
        this.v1 = tmp.v1;
        this.v2 = tmp.v2;
        return this;
    }

    /**
     * 乘法
     * @param other 
     */
    mul(other: Decimal): Decimal {
        let num = this.v1 * other.v1;
        let tmp1 = getShangYu(this.v1 * other.v2, scale);
        let tmp2 = getShangYu(this.v2 * other.v1, scale);
        let tmp3 = getShangYu(this.v2 * other.v2, scale);

        let tmp4 = new Decimal(1, num, 0).addSelf(new Decimal(1, tmp1.shang, tmp1.yu)).addSelf(new Decimal(1, tmp2.shang, tmp2.yu)).addSelf(new Decimal(1, 0, tmp3.shang));
        let sign: DecimalSign = this.sign === other.sign ? 1 : -1;
        return new Decimal(sign, tmp4.v1, tmp4.v2);
    }
    /**
     * 乘法，赋值自己
     * @param other 
     */
    mulSelf(other: Decimal): Decimal {
        let tmp = this.mul(other);
        this.sign = tmp.sign;
        this.v1 = tmp.v1;
        this.v2 = tmp.v2;
        return this;
    }

    /**
     * 除法
     * @param other 
     */
    div(other: Decimal): Decimal {
        let down = other.v1 * scale + other.v2;
        if (down === 0) {
            throw new Error("Decimal div has a zero number");
        }
        let up = this.v1 * scale + this.v2;
        let tmp1 = getShangYu(up, down);
        let tmp2 = getShangYu(tmp1.yu * scale, down);
        let sign: DecimalSign = this.sign === other.sign ? 1 : -1;
        return new Decimal(sign, tmp1.shang, tmp2.shang);
    }

    /**
     * 除法，赋值自己
     * @param other 
     */
    divSelf(other: Decimal): Decimal {
        let tmp = this.div(other);
        this.sign = tmp.sign;
        this.v1 = tmp.v1;
        this.v2 = tmp.v2;
        return this;
    }

    /**
     * 小于
     * @param other 
     */
    LT(other: Decimal): boolean {
        return this.getHugeValue() < other.getHugeValue();
    }

    /**
     * 小于等于
     * @param other 
     */
    LE(other: Decimal): boolean {
        return this.getHugeValue() <= other.getHugeValue();
    }

    /**
     * 等于
     * @param other 
     */
    EQ(other: Decimal): boolean {
        return this.getHugeValue() === other.getHugeValue();
    }

    /**
     * 不等于
     * @param other 
     */
    NE(other: Decimal): boolean {
        return this.getHugeValue() !== other.getHugeValue();
    }

    /**
     * 大于
     * @param other 
     */
    GT(other: Decimal): boolean {
        return this.getHugeValue() > other.getHugeValue();
    }

    /**
     * 大于等于
     * @param other 
     */
    GE(other: Decimal): boolean {
        return this.getHugeValue() >= other.getHugeValue();
    }

    /**
     * 取较大方
     * @param other 
     */
    max(other: Decimal): Decimal {
        return this.GT(other) ? this : other;
    }
    /**
     * 取较小方
     * @param other 
     */
    min(other: Decimal): Decimal {
        return this.LT(other) ? this : other;
    }
}

const ZERO_decimal = new Decimal();

function strLen(str: string, len = dotLen) {
    let strLen = str.length;
    if (strLen === len) {
        return str;
    } else if (strLen > len) {
        return str.substr(0, len);
    } else {
        return str + "0".repeat(len - strLen);
    }
}

// 获取商数和余数
function getShangYu(up: number, down: number): { "shang": number, "yu": number } {
    if (up < down) {
        return { "shang": 0, "yu": up }
    }
    if (up === down) {
        return { "shang": 1, "yu": 0 };
    }
    let shang = Math.floor(up / down) - 1;
    up = up - (down * shang);
    while (up >= down) {
        shang += 1;
        up -= down;
    }
    return { "shang": shang, "yu": up };
}