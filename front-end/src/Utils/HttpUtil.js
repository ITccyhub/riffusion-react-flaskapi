
/**
 * 对fetch方法进行基础封装，统一请求参数，使直接返回Json格式。
 */
export default class HttpUtil {

    /**
     * http get请求
     */
    static get(url) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => {
                    if (response.ok) {
                        return response.json(); // 将文本结果转成json对象
                    } else {
                        throw new Error(response.status + " : " + response.statusText)
                    }
                })
                .then(result => resolve(result))
                .catch(error => {
                    reject(error);
                })
        });
    }


    /**
     * http post请求
     */
    static post(url, data) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                header: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)  // 将json对象转成文本
            })
                .then(response => response.json())
                .then(result => resolve(result))
                .catch(error => {
                    reject(error);
                })
        });
    }


    static postf(url, data) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: { // 修正拼写错误，应为 headers
                    'Accept': 'application/json',
                    // 不再设置 Content-Type，因为要上传文件，而不是普通的 JSON 数据
                },
                body: data // 直接传入 FormData 对象，不再转换为 JSON 字符串
            })
                .then(response => response.json())
                .then(result => resolve(result))
                .catch(error => {
                    reject(error);
                })
        });
    }

}