local util = require "util"
require "class"

local BigDecimal = {}

local BigDecimalScale = 1000000 -- 精度度 = 10^6 不用直接使用10^6会变成浮点数

-- ctor(true, 3, 1) 表示正数 3.000001 
local BigDecimalClass = class()
function BigDecimalClass:ctor(bUnSigned, HInteger, LInteger)
	assert(HInteger >= 0 and HInteger <= 0x7FFFFFFF, string.format("HInteger=%s > %s", HInteger, 0x7FFFFFFF))
	assert(LInteger >= 0 and LInteger <= (BigDecimalScale - 1), string.format("LInteger=%s > %s", LInteger, (BigDecimalScale - 1)))
	local HIntegerRet = string.find(tostring(HInteger), "%.")
	local LIntegerRet = string.find(tostring(LInteger), "%.")
	assert(not (HIntegerRet ~= nil or LIntegerRet ~= nil), string.format("HInteger=%s LInteger=%s is float num.", HInteger, LInteger))

	self.bUnSigned = bUnSigned 	-- true 是正数否则负数
	self.HInteger = HInteger 	-- 整数部分
	self.LInteger = LInteger 	-- 小数部分
	if self.HInteger == 0 and self.LInteger == 0 then self.bUnSigned = true end
end

function BigDecimalClass:ToString()
	local format = string.format("%ss", tostring(BigDecimalScale - 1):len())
	return string.format("%s%s.%0" .. format, not self.bUnSigned and "-" or "", self.HInteger, self.LInteger)
end

function BigDecimalClass:GetHugeValue()
	return (self.HInteger * BigDecimalScale + self.LInteger) * (self.bUnSigned and 1 or -1)
end

function BigDecimalClass:Floor()
	return self.HInteger * (self.bUnSigned and 1 or -1)
end

function BigDecimalClass:Ceil()
	return (self.HInteger + ((self.LInteger > 0) and 1 or 0)) * (self.bUnSigned and 1 or -1)
end

-- 获取商数和余数
local function GetQuotientAndRemainder(numerator, denominator)
	if numerator < denominator then
		return 0, numerator
	end

	local count = math.floor(numerator / denominator) - 1
	count = count >= 0 and count or 0
	numerator = numerator - (denominator * count)

	while numerator >= denominator do
		count = count + 1
		numerator = numerator - denominator
		if numerator < denominator then
			break
		end
	end
	
	return count, numerator
end

-- 加法
function BigDecimal.Add(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	local valueLeft = (BigDecimalClassObjLeft.HInteger * BigDecimalScale + BigDecimalClassObjLeft.LInteger) * (BigDecimalClassObjLeft.bUnSigned and 1 or -1)
	local valueRight = (BigDecimalClassObjRight.HInteger * BigDecimalScale + BigDecimalClassObjRight.LInteger) *(BigDecimalClassObjRight.bUnSigned and 1 or -1)
	local resultValue = valueLeft + valueRight
	local quotient, remainder = GetQuotientAndRemainder(resultValue * (resultValue >= 0 and 1 or -1), BigDecimalScale)
	return BigDecimalClass.new(resultValue >= 0, quotient, remainder)
end

-- 减法
function BigDecimal.Sub(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	local bUnSigned = (not BigDecimalClassObjRight.bUnSigned) and true or false
	return BigDecimal.Add(BigDecimalClassObjLeft, BigDecimalClass.new(bUnSigned, BigDecimalClassObjRight.HInteger, BigDecimalClassObjRight.LInteger))
end

-- 乘法
function BigDecimal.Mul(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	local value = BigDecimalClassObjLeft.HInteger * BigDecimalClassObjRight.HInteger
	local quotientA, remainderA = GetQuotientAndRemainder(BigDecimalClassObjLeft.LInteger * BigDecimalClassObjRight.HInteger, BigDecimalScale)
	local quotientB, remainderB = GetQuotientAndRemainder(BigDecimalClassObjLeft.HInteger * BigDecimalClassObjRight.LInteger, BigDecimalScale)
	local quotientC, remainderC = GetQuotientAndRemainder(BigDecimalClassObjLeft.LInteger * BigDecimalClassObjRight.LInteger, BigDecimalScale)

	local Obj = BigDecimal.Add(BigDecimalClass.new(true, quotientA, remainderA), BigDecimalClass.new(true, quotientB, remainderB))
	Obj = BigDecimal.Add(Obj, BigDecimalClass.new(true, 0, quotientC))
	Obj = BigDecimal.Add(Obj, BigDecimalClass.new(true, value, 0))
	Obj.bUnSigned = (BigDecimalClassObjLeft.bUnSigned == BigDecimalClassObjRight.bUnSigned) and true, false
	return Obj
end

-- 除法
function BigDecimal.Div(BigDecimalClassObj_numerator, BigDecimalClassObj_denominator)
	local value_numerator = BigDecimalClassObj_numerator.HInteger * BigDecimalScale + BigDecimalClassObj_numerator.LInteger
	local value_denominator = BigDecimalClassObj_denominator.HInteger * BigDecimalScale + BigDecimalClassObj_denominator.LInteger
	assert((BigDecimalClassObj_denominator.HInteger + BigDecimalClassObj_denominator.LInteger) ~= 0, "denominator is zero")
	local HInteger, remainder = GetQuotientAndRemainder(value_numerator, value_denominator)
	local LInteger = GetQuotientAndRemainder(remainder * BigDecimalScale, value_denominator)
	local bUnSigned = (BigDecimalClassObj_numerator.bUnSigned == BigDecimalClassObj_denominator.bUnSigned) and true, false
	return BigDecimalClass.new(bUnSigned, HInteger, LInteger)
end

-- 小于 (less than)
function BigDecimal.LT(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	return BigDecimalClassObjLeft:GetHugeValue() < BigDecimalClassObjRight:GetHugeValue()
end

-- 小于等于 (less than and equal to)
function BigDecimal.LE(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	return BigDecimalClassObjLeft:GetHugeValue() <= BigDecimalClassObjRight:GetHugeValue()
end

-- 等于 (equal to)
function BigDecimal.EQ(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	return BigDecimalClassObjLeft:GetHugeValue() == BigDecimalClassObjRight:GetHugeValue()
end

-- 不等于 (not equal to)
function BigDecimal.NE(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	return BigDecimalClassObjLeft:GetHugeValue() ~= BigDecimalClassObjRight:GetHugeValue()
end

-- 大于等于 (greater than and equal to)
function BigDecimal.GE(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	return BigDecimalClassObjLeft:GetHugeValue() >= BigDecimalClassObjRight:GetHugeValue()
end

-- 大于 gt (greater than)
function BigDecimal.GT(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	return BigDecimalClassObjLeft:GetHugeValue() > BigDecimalClassObjRight:GetHugeValue()
end

-- 取最大值
function BigDecimal.Max(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	return BigDecimal.GE(BigDecimalClassObjLeft, BigDecimalClassObjRight) and BigDecimalClassObjLeft or BigDecimalClassObjRight
end

-- 取最小值
function BigDecimal.Min(BigDecimalClassObjLeft, BigDecimalClassObjRight)
	return BigDecimal.LE(BigDecimalClassObjLeft, BigDecimalClassObjRight) and BigDecimalClassObjLeft or BigDecimalClassObjRight
end

-- 取模
function BigDecimal.Mod(numerator, denominator)
	local numeratorRet = string.find(tostring(numerator), "%.")
	local denominatorRet = string.find(tostring(denominator), "%.")
	assert(not (numeratorRet ~= nil or denominatorRet ~= nil), string.format("numerator=%s denominator=%s is float num.", numerator, denominator))
	assert(numerator >= 0 and denominator > 0)
	local _, remainder = GetQuotientAndRemainder(numerator, denominator)
	return remainder
end

BigDecimal.BigDecimalClass = BigDecimalClass

return util.ReadOnlyTable(BigDecimal)
