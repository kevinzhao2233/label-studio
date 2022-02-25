import { useCallback, useContext, useEffect, useRef } from 'react';
import { Button } from '../../components';
import { Form, Label, TextArea, Toggle } from '../../components/Form';
import { MenubarContext } from '../../components/Menubar/Menubar';
import { ProjectContext } from '../../providers/ProjectProvider';

export const InstructionsSettings = () => {
  const { project, fetchProject } = useContext(ProjectContext);
  const pageContext = useContext(MenubarContext);
  const formRef = useRef();

  useEffect(() => {
    pageContext.setProps({ formRef });
  }, [formRef]);

  const updateProject = useCallback(() => {
    fetchProject(project.id, true);
  }, [project]);

  return (
    <div style={{ width: 480 }}>
      <Form ref={formRef} action="updateProject" formData={{ ...project }} params={{ pk: project.id }} onSubmit={updateProject}>
        <Form.Row columnCount={1}>
          <Label text="标注说明" large/>
          <div style={{ paddingLeft: 16 }}>
            <Toggle label="在标注前展示" name="show_instruction"/>
          </div>
          <div style={{ color: "rgba(0,0,0,0.4)", paddingLeft: 16 }}>
            编写说明以帮助标注人员完成标签任务。
          </div>
        </Form.Row>

        <Form.Row columnCount={1}>
          <TextArea name="expert_instruction" style={{ minHeight: 128 }}/>
        </Form.Row>

        <Form.Actions>
          <Form.Indicator>
            <span case="success">保存成功!</span>
          </Form.Indicator>
          <Button type="submit" look="primary" style={{ width: 120 }}>保存</Button>
        </Form.Actions>
      </Form>
    </div>
  );
};

InstructionsSettings.title = "标注说明";
InstructionsSettings.path = "/instruction";
