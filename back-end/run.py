#! /usr/bin/env python
# -*- coding: utf-8 -*-
# 使用flask提供restful接口
# 先安装依赖：pip install flask

from flask import Flask, render_template, request, send_from_directory
import os
import SqliteUtil as DBUtil
import json
import FileUtil
import base64
upload_root_dir = 'uploads'

# Flask初始化参数尽量使用你的包名，这个初始化方式是官方推荐的，官方解释：http://flask.pocoo.org/docs/0.12/api/#flask.Flask
'''
    template_folder 模板文件所在的目录
    static_folder 静态文件根目录（图片、css、js等）
    static_url_path url访问时根目录对应的path，可以自己改，映射到static_folder。和package.json里的homepage对应
'''
#app = Flask(__name__, static_folder="templates",static_url_path="/staff-manager")
app = Flask(__name__, template_folder='front-build', static_folder="front-build", static_url_path="/staff-manager")


# hello
@app.route('/hello')
def hello_world():
    return "Hello Flask!"

# 默认首页
@app.route('/')
def react():
    return render_template('index.html')


# api接口前缀
apiPrefix = '/api/v1/'

# 登录接口
@app.route(apiPrefix + 'login', methods=['POST'])
def login():
    # 获取请求中的用户名和密码
    data = request.get_data(as_text=True)
    data = json.loads(data)
    username = data.get('username')
    password = data.get('password')

    # 调用登录函数进行验证
    login_result = DBUtil.loginUser(username, password)

    # 返回登录结果
    return login_result

##################  Job接口  ###############



@app.route(apiPrefix + 'getJobList')
def getJobList():
    return DBUtil.getJobList()

@app.route(apiPrefix + 'updateJob', methods=['POST'])
def updateJob():
    data = request.get_data(as_text=True)
    re = DBUtil.addOrUpdateJob(data)
    return re

@app.route(apiPrefix + 'deleteJob/<int:id>')
def deleteJob(id):
    re = DBUtil.deleteJob(id)
    print(re)
    return re



##################  Staff接口  ###############

@app.route(apiPrefix + 'getStaffList/<int:job>')
def getStaffList(job):
    array = DBUtil.getStaffList(job)
    jsonStaffs = DBUtil.getStaffsFromData(array)
    return json.dumps(jsonStaffs)


@app.route(apiPrefix + 'updateStaff', methods=['POST'])
def updateStaff():
    data = request.get_data(as_text=True)
    re = DBUtil.addOrUpdateStaff(data)
    if re['code'] >= 0: # 数据保存成功，移动附件
        FileUtil.fileMoveDir(re['id'])
    return json.dumps(re)


@app.route(apiPrefix + 'deleteStaff/<int:id>')
def deleteStaff(id):
    FileUtil.fileDeleteDir(id)  # 文件删掉
    re = DBUtil.deleteStaff(id)
    return re


@app.route(apiPrefix + 'searchStaff')
def searchStaff():
    data = request.args.get('where')
    print("searchStaff:", data)
    where = json.loads(data)
    array = DBUtil.searchStaff(where)
    jsonStaffs = DBUtil.getStaffsFromData(array)
    re = json.dumps(jsonStaffs)
    return re



##################  File接口  ###############
#
# @app.route(apiPrefix + 'fileUpload', methods=['POST'])
# def fileUpload():
#     f = request.files["file"]
#     return FileUtil.fileUpload(f)

@app.route(apiPrefix + 'fileUpload', methods=['POST'])
def fileUpload():
    # 获取上传的文件和是否公开分享的参数
    f = request.files["file"]
    is_public = request.form.get("public")
    if is_public == 'true':
        is_public = 1
    else:
        is_public = 0
    userid = request.form.get("userId")

    # 调用文件上传函数，并将是否公开分享的参数传递给它
    return FileUtil.fileUploads(f, is_public, userid)


from flask import jsonify

@app.route(apiPrefix + 'publicMusicFiles', methods=['GET'])
def publicMusicFiles():
    try:
        # 查询数据库获取所有公开的音乐文件信息，假设你的数据库查询函数为getPublicMusicFiles
        public_music_files =DBUtil.getPublicFileRecords()

        # 根据需求处理音乐文件信息，这里简单地将文件信息转换为字典列表
        music_list = [{'id': record[0], 'file_path': record[1]} for record in public_music_files]

        # 返回公开音乐文件列表
        return jsonify({'code': 0, 'public_music_files': music_list})
    except Exception as e:
        # 处理异常情况
        return jsonify({'code': -1, 'message': str(e)}), 500

@app.route(apiPrefix + 'fileDelete/<int:id>/<name>', methods=['GET'])
# def fileDelete(id, name):
#     return FileUtil.fileDelete(id, name)

@app.route(apiPrefix + 'userMusic/<int:id>', methods=['GET'])
def getUserMusic(id):
    try:
        # 获取用户 ID，这里假设从请求头中获取
        user_id = id
        if user_id is None:
            return jsonify({'code': -1, 'message': '未提供用户 ID'}), 400

        # 根据用户 ID 查询该用户拥有的所有音乐文件记录
        music_records = DBUtil.getUserMusicRecords(user_id)
        if music_records is None:
            return jsonify({'code': -1, 'message': '查询用户音乐文件失败'}), 500

        # 根据查询结果构造返回的数据
        music_list = [{'id': record[0], 'file_path': record[1]} for record in music_records]

        return jsonify({'code': 0, 'music_files': music_list})
    except Exception as e:
        return jsonify({'code': -1, 'message': str(e)}), 500



def playMusicById(music_id):
    try:
        # 根据音乐文件 ID 查询文件路径
        # sql_get_music_path = '''SELECT file_path FROM file_info WHERE id=?'''
        # cursor.execute(sql_get_music_path, (music_id,))
        # music_path = cursor.fetchone()
        music_path=DBUtil.getFilePathByIdp(music_id)

        if music_path:
            # 从服务器获取音乐文件并转换为 Base64 格式
            with open(music_path, 'rb') as f:
                music_data = f.read()
                encoded_music_data = base64.b64encode(music_data).decode('utf-8')
            return encoded_music_data
        else:
            return None
    except Exception as e:
        return None


@app.route(apiPrefix + 'playMusic', methods=['POST'])
def playMusic():
    try:
        # 获取请求中的音乐文件 ID
        data = request.get_data(as_text=True)
        data = json.loads(data)
        music_id = data.get("music_id")

        # 根据音乐文件 ID 进行相应的播放逻辑，这里假设你有一个名为playMusicById的函数来实现
        play_result = playMusicById(music_id)

        # 返回播放结果
        return jsonify({'code': 0, 'message': play_result})
    except Exception as e:
        # 处理异常情况
        return jsonify({'code': -1, 'message': str(e)}), 500


# @app.route(apiPrefix + 'commentMusic', methods=['POST'])
# def commentMusic():
#     try:
#         # 获取请求中的音乐文件 ID 和评论内容
#         music_id = request.form.get("music_id")
#         comment_content = request.form.get("comment_content")
#
#         # 根据音乐文件 ID 和评论内容进行相应的评论逻辑，这里假设你有一个名为commentMusicById的函数来实现
#         comment_result = commentMusicById(music_id, comment_content)
#
#         # 返回评论结果
#         return jsonify({'code': 0, 'message': comment_result})
#     except Exception as e:
#         # 处理异常情况
#         return jsonify({'code': -1, 'message': str(e)}), 500



@app.route(apiPrefix + 'fileDelete/<int:id>/<name>', methods=['GET'])
def fileDelete(id, name):
    return FileUtil.fileDelete(id, name)


@app.route(apiPrefix + 'fileDeleteDir/<int:id>', methods=['GET'])
def fileDeleteDir(id):
    return FileUtil.fileDeleteDir(id)


@app.route(apiPrefix + 'fileGetList/<int:id>', methods=['GET'])
def fileGetList(id):
    return FileUtil.fileGetList(id)


@app.route(apiPrefix + 'fileGet/<int:id>/<name>', methods=['GET'])
def fileGet(id, name):
    path = FileUtil.fileGetDir(id)
    # 参数as_attachment=True，否则对于图片格式、txt格式，会把文件内容直接显示在浏览器，对于xlsx等格式，虽然会下载，但是下载的文件名也不正确
    return send_from_directory(path, name, as_attachment=True)

@app.route(apiPrefix + 'fileBackup')
def fileBackup():
    return DBUtil.saveStaffToCVX(0)

@app.route(apiPrefix + 'fileGetBackup')
def fileGetBackup():
    path = './backup/'
    return send_from_directory(path, 'staffList.csv', as_attachment=True)






# if __name__ == '__main__': 确保服务器只会在该脚本被 Python 解释器直接执行的时候才会运行，而不是作为模块导入的时候。
if __name__ == "__main__":
    # 如果不限于本机使用：app.run(host='0.0.0.0')
    # 调试模式，修改文件之后自动更新重启。
    app.run(debug=True)
