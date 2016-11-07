'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   uzfin.com
 * @create      07/13/2015
 */

let _         = require('lodash'),
    moment    = require('moment'),
    strman    = require('strman'),
    cheerio   = require('cheerio'),
    columnify = require('columnify');

let start   = new Date().getTime();
let conf    = require('./conf').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = require('request');

moment.locale('zh-cn');

let showCal = function showCal(){

    return request(conf.cal, (e, r, body) => {
        if(e || (r && r.statusCode !== 200)){
            /* eslint no-unused-expressions:0 */
            console.error('Request error, Please try again later. Error info:',
                           JSON.stringify(e||r, null, 4)).error;
            return false;
        }

        let html   = iconv.convert(body).toString();
        let $      = cheerio.load(html, { decodeEntities:false });
        let $tr    = $('tr', conf.cal.selector);
        let $td    = null,
            evt    = null,
            date   = null,
            dayOfW = null,
            evts   = [];

        let headers = { date:'日期', dayOfW:'星期', evt:'事件' };
        let option  = {
            minWidth         : 5,
            columnSplitter   : '   ',
            headingTransform : h => headers[h].em.underline,
        };

        console.log((`\n中国股市未来30日题材前瞻${' '.repeat(60)}\n`).em.underline);

        $tr.each(function stripEvts(){
            $td = $('td', this);

            if($td.length){
                date   = _.trim($td.eq(0).html());
                dayOfW = moment.localeData().weekdaysShort(moment(`${moment().year()}年${date}`, conf.fmt.cnDate));
                evt    = strman.collapseWhitespace($td.eq(1).text());
                evt    = strman.htmlDecode(evt);
                evts.push({ date, dayOfW, evt:_.trimStart(_.trim(evt), ', ') });
            }
        });
        console.log(columnify(evts, option));

        let end = new Date().getTime();
        console.log(' '.repeat(80).underline.yellow);
        console.log(' '.repeat(20) + 'Done!'.header, '操作耗时:', (`${end - start} ms`).em,
                    ' '.repeat(15),'By uzfin.com\n' );
        return false;
    });
};

exports.Cal = {
    showCal,
};
