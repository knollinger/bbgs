package de.bbgs.accounting;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name="projects-model")
@XmlType(name="ProjectsModel")
public class ProjectsModel implements IJAXBObject
{
    @XmlElement(name="project")
    public Collection<ProjectDescription> projects = new ArrayList<>();
}
