export const enum cmd {
	/**
	 * 进入游戏
	 */
	gate_main_enter = 0,
	/**
	 * 匹配与否
	 */
	gate_main_matchOrNot = 1,
	/**
	 * 发送帧消息
	 */
	gate_main_frameMsg = 2,
	/**
	 * 通知，帧消息
	 */
	onFrame = 3,
	/**
	 * 游戏开始
	 */
	onStartGame = 4,
	/**
	 * 游戏结束
	 */
	gate_main_gameOver = 5,
	/**
	 * 获取录像列表
	 */
	gate_main_getMovieList = 6,
	/**
	 * 观看录像
	 */
	gate_main_getMovieData = 7,
}