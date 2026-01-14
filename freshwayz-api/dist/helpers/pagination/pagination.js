"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
async function paginate(qb, meta) {
    const totalCount = await qb.getCount();
    const totalPages = Math.ceil(totalCount / meta.limit);
    const items = await qb
        .skip((meta.page - 1) * meta.limit)
        .take(meta.limit)
        .getMany();
    return {
        items,
        meta: {
            totalItems: totalCount,
            itemCount: items.length,
            itemsPerPage: meta.limit,
            totalPages,
            currentPage: meta.page,
        },
    };
}
//# sourceMappingURL=pagination.js.map