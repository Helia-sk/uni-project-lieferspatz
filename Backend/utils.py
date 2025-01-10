from flask import logging


def validate_request(data, required_fields):
    """
    Validate if required fields are present in the request data.
    :param data: The input JSON data from the request
    :param required_fields: List of required fields
    :return: None if valid, error dictionary if invalid
    """
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        logging.error(f"Validation failed. Missing fields: {missing_fields}")
        return {'error': f"Missing fields: {', '.join(missing_fields)}"}
    return None
