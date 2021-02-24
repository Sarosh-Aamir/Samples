/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * Author Sarosh Aamir
 */
define(['N/email', 'N/error', 'N/record', 'N/runtime', 'N/search', 'N/task'],
    /**
     * @param{email} email
     * @param{error} error
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{task} task
     */
    function (email, error, record, runtime, search, task) {


        function transformTO_IF(tOrd) {
            var trecord = record.transform({
                fromType: record.Type.TRANSFER_ORDER,
                fromId: tOrd.id,
                toType: record.Type.ITEM_FULFILLMENT,
                isDynamic: true

            });

            var qty = trecord.getLineCount({sublistId: 'item'});

            for (var line = 0; line < qty; line++) {
                trecord.selectLine({
                    sublistId: 'item',
                    line: line
                });

                var quantity = trecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemquantity'

                });
                log.debug('Quant', quantity)

                trecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: quantity
                });
                /**
                 * set any other fields if require
                 */

                trecord.commitLine({
                    sublistId: 'item'
                });
            }
            var idr = trecord.save();
            return idr;

        }

        /**
         * Marks the beginning of the Map/Reduce process and generates input data.
         *
         * @typedef {Object} ObjectRef
         * @property {number} id - Internal ID of the record instance
         * @property {string} type - Record type id
         *
         * @return {Array|Object|Search|RecordRef} inputSummary
         * @since 2015.1
         */

        function getInputData() {
            try {

                return {type: 'search', id: 'customsearch_receiving_transfers_script'}
            } catch
                (ex) {

                log.debug({title: "Error", details: JSON.stringify(ex)});

            }
            return {};


        }

        /**
         * Executes when the map entry point is triggered and applies to each key/value pair.
         *
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         * @since 2015.1
         */
        function map(context) {

            try {

                var tOrd = JSON.parse(context.value);
                log.debug({title: "Transfer Order ", details: JSON.stringify(tOrd)});
                log.debug({title: "TO id", details: "" + tOrd.id});
                var ifId = transformTO_IF(tOrd);
                context.write(tOrd.id, "Transformed To Item Fulfillment:" + ifId);

            } catch (e) {
                log.debug({title: "Map Stage Error", details: JSON.stringify(e)});
                context.write(tOrd.id, "Not Created:" + JSON.stringify(e));


            }
        }

        /**
         * Executes when the reduce entry point is triggered and applies to each group.
         *
         * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
         * @since 2015.1
         */
        function reduce(context) {

        }


        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {

        }

        return {
            getInputData: getInputData,
            map: map,
            //reduce: reduce,
            summarize: summarize
        };

    })
;
