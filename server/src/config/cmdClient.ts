export const enum cmd {
	/**
	 * 进入游戏
	 */
	gate_main_enter = "gate.main.enter",
	/**
	 * 匹配与否
	 */
	gate_main_matchOrNot = "gate.main.matchOrNot",
	/**
	 * 发送帧消息
	 */
	gate_main_frameMsg = "gate.main.frameMsg",
	/**
	 * 通知，帧消息
	 */
	onFrame = "onFrame",
	/**
	 * 游戏开始
	 */
	onStartGame = "onStartGame",
	/**
	 * 游戏结束
	 */
	gate_main_gameOver = "gate.main.gameOver",
	/**
	 * 获取录像列表
	 */
	gate_main_getMovieList = "gate.main.getMovieList",
	/**
	 * 观看录像
	 */
	gate_main_getMovieData = "gate.main.getMovieData",
}