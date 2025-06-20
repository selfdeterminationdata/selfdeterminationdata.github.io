const getGroupByID = (req, res) => {
    const id = 700010;

    const group = {
        'groupID': id,
        'groupName' : 'Hazaras',
        'claim' : 'Independence',
        'violent': false,
        'ccode': 700
    }

    res.status(200).json(group)
}

module.exports = {
    getGroupByID,
}