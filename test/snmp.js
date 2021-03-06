var assert = require('assert');
var snmp = require('snmp');

// A packet as generated by this library, lightly modified by hand to contain easily
// distinguishable fields.
var ex1 = new Buffer('30 2c 02 01 47 04 07 70 72 69 76 61 74 65 a4 1e 02 01 33 02 01 44 02 01 55 30 13 30 11 06 0d 2b 06 01 04 01 94 78 01 02 07 03 02 00 05 00'.replace(/ /g, ''), 'hex');
// A OctetString GetResponse from Net-SNMP
var ex2 = new Buffer('304a 0201 0104 066e 796d 2e73 65a2 3d02 0459 8559 7002 0100 0201 0030 2f30 2d06 082b 0601 0201 0101 0004 2153 6f6c 6172 6973 2061 6e74 6f2e 6e79 6d2e 7365 2031 312e 3020 7068 7973 6963 616c'.replace(/ /g, ''), 'hex');
// A Counter32 GetResponse from Net-SNMP
var ex3 = new Buffer('302e 0201 0104 0770 7269 7661 7465 a220 0204 12a1 7180 0201 0002 0100 3012 3010 060b 2b06 0102 011f 0101 0102 0141 0146'.replace(/ /g, ''), 'hex');
// A Counter64 GetResponse from Net-SNMP
var ex4 = new Buffer('3030 0201 0104 0770 7269 7661 7465 a222 0204 07ba d0c8 0201 0002 0100 3014 3012 060b 2b06 0102 011f 0101 0106 0146 0305 369d'.replace(/ /g, ''), 'hex');
// A Gauge32 GetResponse from Net-SNMP
var ex5 = new Buffer('3030 0201 0104 0770 7269 7661 7465 a222 0204 15fc af68 0201 0002 0100 3014 3012 060a 2b06 0102 0102 0201 0507 4204 3b9a ca00'.replace(/ /g, ''), 'hex');
// A TimeTicks GetResponse from Net-SNMP
var ex6 = new Buffer('302e 0201 0104 0770 7269 7661 7465 a220 0204 72eb 6a85 0201 0002 0100 3012 3010 0609 2b06 0102 0119 0101 0043 0304 74ec'.replace(/ /g, ''), 'hex');
// A large SysDescr response.
var ex7 = new Buffer('3081 ab02 0101 0407 7072 6976 6174 65a2 819c 0204 5d7f aeee 0201 0002 0100 3081 8d30 818a 0608 2b06 0102 0101 0100 047e 4461 7277 696e 206a 626f 7267 2d6d 6270 2031 312e 322e 3020 4461 7277 696e 204b 6572 6e65 6c20 5665 7273 696f 6e20 3131 2e32 2e30 3a20 5475 6520 4175 6720 2039 2032 303a 3534 3a30 3020 5044 5420 3230 3131 3b20 726f 6f74 3a78 6e75 2d31 3639 392e 3234 2e38 7e31 2f52 454c 4541 5345 5f58 3836 5f36 3420 7838 365f 3634'.replace(/ /g, ''), 'hex');
// A OID GetNextReponse
var ex8 = new Buffer('30 35 02 01 01 04 07 70 72 69 76 61 74 65 a2 27 02 04 e6 34 17 a0 02 01 00 02 01 00 30 19 30 17 06 08 2b 06 01 02 01 01 02 00 06 0b 2b 06 01 04 01 bf 08 03 02 81 7f'.replace(/ /g, ''), 'hex');
// An IpAddress GetNextResponst
var ex9 = new Buffer('30 36 02 01 01 04 07 70 72 69 76 61 74 65 a2 28 02 04 45 20 95 bb 02 01 00 02 01 00 30 1a 30 18 06 10 2b 06 01 02 01 03 01 01 03 04 01 81 2c 14 0a 01 40 04 ac 14 0a 01'.replace(/ /g, ''), 'hex');

describe('snmp', function () {
    describe('encode()', function () {
        it('returns a correctly formatted buffer from a packet description', function () {
            var correct = '30 2c 02 01 01 04 07 70 72 69 76 61 74 65 a0 1e 02 01 05 02 01 06 02 01 07 30 13 30 11 06 0d 2b 06 01 04 01 94 78 01 02 07 03 02 00 05 00'.replace(/ /g, '');
            var pkt = new snmp.Packet(); // A default getrequest
            pkt.community = 'private';
            pkt.pdu.reqid = 5;
            pkt.pdu.error = 6;
            pkt.pdu.errorIndex = 7;
            pkt.pdu.varbinds[0].oid = [1, 3, 6, 1, 4, 1, 2680, 1, 2, 7, 3, 2, 0];
            var msg = snmp.encode(pkt);
            assert.equal(msg.toString('hex'), correct);
        });
        it('returns a correctly formatted buffer from a packet description of a set request', function () {
            var correct = '302d 0201 0104 0770 7269 7661 7465 a31f 0204 380b b460 0201 0002 0100 3011 300f 060a 2b06 0102 0102 0201 0701 0201 02'.replace(/ /g, '');
            var pkt = new snmp.Packet(); // A default getrequest
            pkt.community = 'private';
            pkt.pdu.reqid = 940291168;
            pkt.pdu.type = 3;
            pkt.pdu.varbinds[0].oid = [1, 3, 6, 1, 2, 1, 2, 2, 1, 7, 1];
            pkt.pdu.varbinds[0].type = 2;
            pkt.pdu.varbinds[0].value = 2;
            var msg = snmp.encode(pkt);
            assert.equal(msg.toString('hex'), correct);
        });
    });

    describe('parse()', function () {
        it('throws a parse error for invalid packets', function (done) {
            try {
                snmp.parse(new Buffer('00112233445566', 'hex'));
            } catch (err) {
                done();
            }
        });
        it('returns a snmp.Packet structure', function () {
            var pkt = snmp.parse(ex1);
            assert.equal('Packet', pkt.constructor.name);
        });
        it('returns a correct SNMP version field', function () {
            var pkt = snmp.parse(ex1);
            assert.equal(0x47, pkt.version);
        });
        it('returns a correct SNMP community field', function () {
            var pkt = snmp.parse(ex1);
            assert.equal('private', pkt.community);
        });
        it('returns a correct pdu type field', function () {
            var pkt = snmp.parse(ex1);
            assert.equal(4, pkt.pdu.type);
        });
        it('returns a correct request id field', function () {
            var pkt = snmp.parse(ex1);
            assert.equal(0x33, pkt.pdu.reqid);
        });
        it('returns a correct error field', function () {
            var pkt = snmp.parse(ex1);
            assert.equal(0x44, pkt.pdu.error);
        });
        it('returns a correct error index field', function () {
            var pkt = snmp.parse(ex1);
            assert.equal(0x55, pkt.pdu.errorIndex);
        });
        it('returns a correct varbind list', function () {
            var pkt = snmp.parse(ex1);
            assert.equal(1, pkt.pdu.varbinds.length);
            assert.deepEqual([1, 3, 6, 1, 4, 1, 2680, 1, 2, 7, 3, 2, 0], pkt.pdu.varbinds[0].oid);
            assert.equal(5, pkt.pdu.varbinds[0].type); // Null type
            assert.equal(null, pkt.pdu.varbinds[0].value);
        });
        it('returns a correctly parsed Net-SNMP OctetString GetResponse', function () {
            var pkt = snmp.parse(ex2);
            assert.equal(4, pkt.pdu.varbinds[0].type);
            assert.equal('Solaris anto.nym.se 11.0 physical', pkt.pdu.varbinds[0].value);
        });
        it('returns a correctly parsed Net-SNMP Counter32 GetResponse', function () {
            var pkt = snmp.parse(ex3);
            assert.equal(65, pkt.pdu.varbinds[0].type);
            assert.equal(70, pkt.pdu.varbinds[0].value);
        });
        it('returns a correctly parsed Net-SNMP Counter64 GetResponse', function () {
            var pkt = snmp.parse(ex4);
            assert.equal(70, pkt.pdu.varbinds[0].type);
            assert.equal(341661, pkt.pdu.varbinds[0].value);
        });
        it('returns a correctly parsed Net-SNMP Gauge32 GetResponse', function () {
            var pkt = snmp.parse(ex5);
            assert.equal(66, pkt.pdu.varbinds[0].type);
            assert.equal(1000000000, pkt.pdu.varbinds[0].value);
        });
        it('returns a correctly parsed Net-SNMP TimeTicks GetResponse', function () {
            var pkt = snmp.parse(ex6);
            assert.equal(67, pkt.pdu.varbinds[0].type);
            assert.equal(292076, pkt.pdu.varbinds[0].value);
        });
        it('returns a correctly parsed large OctetString response', function () {
            var pkt = snmp.parse(ex7);
            assert.equal(4, pkt.pdu.varbinds[0].type);
            assert.equal("Darwin jborg-mbp 11.2.0 Darwin Kernel Version 11.2.0: Tue Aug  9 20:54:00 PDT 2011; root:xnu-1699.24.8~1/RELEASE_X86_64 x86_64", pkt.pdu.varbinds[0].value);
        });
        it('returns a correctly parsed ObjectId response', function () {
            var pkt = snmp.parse(ex8);
            assert.equal(6, pkt.pdu.varbinds[0].type);
            assert.deepEqual([1,3,6,1,4,1,8072,3,2,255], pkt.pdu.varbinds[0].value);
        });
        it('returns a correctly parsed IpAddress response', function () {
            var pkt = snmp.parse(ex9);
            assert.equal(64, pkt.pdu.varbinds[0].type);
            assert.deepEqual([172,20,10,1], pkt.pdu.varbinds[0].value);
        });
    });

    describe('compareOids()', function () {
        it('returns zero for two empty OIDs', function () {
            assert.equal(0, snmp.compareOids([], []));
        });
        it('returns in the favour of the non-undefinedOID', function () {
            assert.equal(1, snmp.compareOids(undefined, []));
            assert.equal(-1, snmp.compareOids([], undefined));
        });
        it('returns in the favour of the non-empty OID', function () {
            assert.equal(1, snmp.compareOids([], [0]));
            assert.equal(-1, snmp.compareOids([0], []));
        });
        it('returns in the favour of the larger OID', function () {
            assert.equal(1, snmp.compareOids([1,2,1,2,1,2,1,2], [1,2,1,2,5,2]));
            assert.equal(-1, snmp.compareOids([1,2,1,2,5,2], [1,2,1,2,1,2,1,2]));
        });
        it('returns in the favour of the longer OID', function () {
            assert.equal(1, snmp.compareOids([1,2,1,2,1,2,1,2], [1,2,1,2,1,2,1,2,1,2]));
            assert.equal(-1, snmp.compareOids([1,2,1,2,1,2,1,2,1,2,1,2], [1,2,1,2,1,2,1,2]));
        });
    });
});

