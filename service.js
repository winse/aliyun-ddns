'use strict';
const http = require('http');
const alidns = require('./alidns.js');

// 这段代码首先会检查已有的记录
// 如果记录不存在, 会新建一个解析, 并返回 created
// 如果记录存在, ip 没变化, 不会更新 ip, 并返回 nochg
// 如果记录存在, ip 有变化, 会更新 ip, 并返回 updated
// 如果阿里云端返回 400 错误, 则返回 error
const updateRecord = function (target, callback) {
    const ip = target.ip;
    const type = target.type;
    const subDomain = target.hostname;
    const domainParts = subDomain.split('.');
    const domainName = domainParts.slice(-2).join('.');
    const rr = (domainParts.length > 2) ? subDomain.split('.').slice(0, -2).join('.') : '@';
    const describeSubParams = {
      Action: 'DescribeSubDomainRecords',
      SubDomain: subDomain
    };
    const updateParams = {
      Action: 'UpdateDomainRecord',
      RecordId: '',
      RR: rr,
      Type: type,
      Value: ip
    };
    const addParams = {
      Action: 'AddDomainRecord',
      DomainName: domainName,
      RR: rr,
      Type: type,
      Value: ip
    };

    // 首先获取域名信息, 目的是获取要更新的域名的 RecordId
    http.request({
        host: alidns.ALIDNS_HOST,
        path: alidns.getPath(describeSubParams)
    }, res => {
        let body = [];
        res.on('data', chunk => body.push(chunk))
            .on('end', () => {
                body = Buffer.concat(body).toString();
                const result = JSON.parse(body);
                // 获取要更新的域名的 RecordId, 并检查是否需要更新
                let shouldUpdate = false;
                let shouldAdd = true;

                if (!result.DomainRecords) {
                    console.log(result);
                    return;
                }

                result.DomainRecords.Record
                    .filter(record => record.RR === updateParams.RR && record.Type === updateParams.Type)
                    .forEach(record => {
                        shouldAdd = false;
                        if (record.Value !== updateParams.Value) {
                            shouldUpdate = true;
                            updateParams.RecordId = record.RecordId;
                        }
                    });
                if (shouldUpdate) {
                    // 更新域名的解析
                    http.request({
                        host: alidns.ALIDNS_HOST,
                        path: alidns.getPath(updateParams)
                    }, res => {
                        if (res.statusCode === 200) {
                            callback('updated');
                        } else {
                            console.err("Failed to update target error");
                            res.pipe(process.stderr);
                            callback('error');
                        }
                    }).end();
                } else if (shouldAdd) {
                    // 增加新的域名解析
                    http.request({
                        host: alidns.ALIDNS_HOST,
                        path: alidns.getPath(addParams)
                    }, res => {
                        if (res.statusCode === 200) {
                            callback('added');
                        } else {
                            callback('error');
                        }
                    }).end();
                } else {
                    callback('nochg');
                }
            });
    }).end();
};

exports.updateRecord = updateRecord;