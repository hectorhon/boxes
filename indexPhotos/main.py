import os
import datetime
import re
# import uuid
import mimetypes
import hashlib
import pprint
import requests


def try_parse_image_date_from_file(fullpath):

    def try_parse_from_YYYYMMDD_hhmmss(s):
        regex = re.compile('([0-9]{4})([0-9]{2})([0-9]{2})_([0-9]{2})([0-9]{2})([0-9]{2})')
        match = regex.match(s)
        if (match):
            return datetime.datetime(*(map(int, match.groups())))
        else:
            return None

    filename = os.path.basename(fullpath)
    return try_parse_from_YYYYMMDD_hhmmss(filename)


class File:
    def __init__(self, fullpath, guessed_mime_type):
        # self.id = uuid.uuid4()
        self.name = os.path.basename(fullpath)
        self.fullpath = fullpath
        self.mime_type = guessed_mime_type
        self.image_date = try_parse_image_date_from_file(fullpath)
        # self.new_fullpath = None


def run(rootpath, path_prefix, batch_name):

    print(f'Start indexing from {rootpath}...')

    files = []

    # with open('output.txt', 'w') as f:
    #     for dirpath, dirnames, filenames in os.walk(rootpath):
    #         for fullpath in [os.path.join(dirpath, filename) for filename in filenames]:
    #             f.write(f'{fullpath}\n')

    for dirpath, dirnames, filenames in os.walk(rootpath):
        for filename in filenames:
            fullpath = os.path.join(dirpath, filename)
            guessed_mime_type = mimetypes.guess_type(fullpath)[0]
            if 'image' not in guessed_mime_type:
                continue

            file = File(fullpath, guessed_mime_type)
            files.append(file)
        break                   # no recursion

    files.sort(key=lambda file: (file.image_date is None, file.image_date))

    # for file in files:
    #     print(file.image_date, file.fullpath)

    # for file in files:
    #     src = file.fullpath
    #     id = uuid.uuid4()
    #     _, file_extension = os.path.splitext(fullpath)
    #     new_filename = f'{id}{file_extension}'
    #     dst = os.path.join(settings.BASE_DIR, settings.MEDIA_ROOT, new_filename)
    #
    #     print(f'Copying from {src} to {dst}')
    #     shutil.copyfile(src, dst)
    #
    #     file.new_fullpath = dst
    #     file.id = id

    for file in files:
        post_to_server(file, path_prefix, batch_name)
        break

    return files


def get_file_sha256(fullpath):
    h = hashlib.sha256()
    with open(fullpath, 'rb') as file:
        while True:
            chunk = file.read(h.block_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


pp = pprint.PrettyPrinter(indent=4)


def post_to_server(file, path_prefix, batch_name):
    json = {
        'name': file.name,
        'path': file.fullpath[len(path_prefix):],
        'mimeType': file.mime_type,
        'entryDate': file.image_date,
    }
    pp.pprint(json)
    try:
        url = 'http://localhost:3000/api/filestore/newEntry?batch=' + batch_name
        response = requests.post(url, json)
        response.raise_for_status()
    except requests.exceptions.RequestException:
        print(response.text)
        raise
